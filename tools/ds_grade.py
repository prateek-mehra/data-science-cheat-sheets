#!/usr/bin/env python3
"""Grade a Data Science Framework submission.

    python3 tools/ds_grade.py assessments/submissions/<test-id>/<stamp>

reads answers.json (variables captured from the kernel at submit time) and
submission.csv from that folder, compares them with the test's hidden answers
and labels, and writes grade.json next to them. The server calls grade() at submit.
Standard library only, so it runs without pandas.
"""
import csv
import json
import math
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TESTS_DIR = os.path.join(REPO_ROOT, "assessments", "tests")


def _num(v):
    if isinstance(v, bool):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v.strip())
        except ValueError:
            return None
    if isinstance(v, list) and len(v) == 1:  # e.g. a one-element array
        return _num(v[0])
    return None


def _norm_key(k):
    s = str(k).strip()
    try:
        f = float(s)
        if f.is_integer():
            return str(int(f))
    except ValueError:
        pass
    return s.lower()


def check_value(kind, got, want, tol):
    """Return (passed, note)."""
    if got is None:
        return False, "variable not defined (or the cell that sets it was not run)"
    if kind == "number":
        g = _num(got)
        if g is None:
            return False, "expected a number, got %r" % (got,)
        ok = abs(g - float(want)) <= tol + 1e-9
        return ok, "" if ok else "expected %s, got %s" % (want, got)
    if kind == "dict":
        if not isinstance(got, dict):
            return False, "expected a dict, got %s" % type(got).__name__
        g = {_norm_key(k): v for k, v in got.items()}
        w = {_norm_key(k): v for k, v in want.items()}
        if set(g) != set(w):
            return False, "keys differ: expected %s, got %s" % (sorted(w), sorted(g))
        bad = []
        for k in w:
            gv = _num(g[k])
            if gv is None or abs(gv - float(w[k])) > tol + 1e-9:
                bad.append("%s: expected %s, got %s" % (k, w[k], g[k]))
        return not bad, "; ".join(bad)
    if kind == "string":
        ok = str(got).strip().lower() == str(want).strip().lower()
        return ok, "" if ok else "expected %r, got %r" % (want, got)
    if kind == "dict_str":
        if not isinstance(got, dict):
            return False, "expected a dict, got %s" % type(got).__name__
        g = {_norm_key(k): str(v).strip().lower() for k, v in got.items()}
        w = {_norm_key(k): str(v).strip().lower() for k, v in want.items()}
        ok = g == w
        return ok, "" if ok else "expected %s, got %s" % (want, got)
    return False, "unknown check kind %s" % kind


def f1(y_true, y_pred, pos=1):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == pos and p == pos)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t != pos and p == pos)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == pos and p != pos)
    return 0.0 if tp == 0 else 2 * tp / (2 * tp + fp + fn)


def macro_f1(y_true, y_pred):
    classes = sorted(set(y_true))
    return sum(f1(y_true, y_pred, c) for c in classes) / len(classes)


def roc_auc(y_true, scores):
    """Rank-based AUC (Mann-Whitney U) with average ranks for ties."""
    pairs = sorted(zip(scores, y_true))
    ranks, i = [0.0] * len(pairs), 0
    while i < len(pairs):
        j = i
        while j + 1 < len(pairs) and pairs[j + 1][0] == pairs[i][0]:
            j += 1
        for k in range(i, j + 1):
            ranks[k] = (i + j) / 2 + 1
        i = j + 1
    n_pos = sum(1 for _, t in pairs if t == 1)
    n_neg = len(pairs) - n_pos
    if not n_pos or not n_neg:
        return 0.5
    r_pos = sum(r for r, (_, t) in zip(ranks, pairs) if t == 1)
    return (r_pos - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg)


def rmse(y_true, y_pred):
    return math.sqrt(sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true))


def _as_label(s):
    s = str(s).strip().lower()
    if s in ("1", "1.0", "true", "yes"):
        return 1
    if s in ("0", "0.0", "false", "no"):
        return 0
    return None


def _as_float(s):
    try:
        v = float(str(s).strip())
        return v if math.isfinite(v) else None
    except ValueError:
        return None


# How each submission kind parses a cell, what a missing prediction becomes, and the label parser.
KINDS = {
    "binary": (_as_label, lambda labels: 0, lambda s: int(float(s)), "0/1"),
    "probability": (lambda s: (lambda v: v if v is not None and 0 <= v <= 1 else None)(_as_float(s)),
                    lambda labels: 0.0, lambda s: int(float(s)), "probabilities between 0 and 1"),
    "number": (_as_float, lambda labels: sum(labels) / len(labels), float, "numbers"),
    "class": (lambda s: str(s).strip().lower() or None, lambda labels: "", lambda s: str(s).strip().lower(), "class names"),
}
METRICS = {
    "f1": lambda y, p: f1(y, p),
    "macro_f1": macro_f1,
    "roc_auc": roc_auc,
    "rmse": rmse,
}


def grade_submission_csv(test, test_dir, path):
    sub = test["submission"]
    kind = sub.get("kind", "binary")
    parse, fallback, parse_label, kind_desc = KINDS[kind]
    res = {"file_found": os.path.exists(path), "problems": []}
    if not res["file_found"]:
        res["problems"].append("submission.csv was not found in the working directory")
        return res, 0.0
    labels = {}
    with open(os.path.join(test_dir, sub["labels_file"]), newline="") as f:
        for row in csv.DictReader(f):
            labels[_norm_key(row[sub["id_column"]])] = parse_label(row[sub["label_column"]])
    preds, bad_values = {}, 0
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        cols = [c.strip() for c in (reader.fieldnames or [])]
        res["columns"] = cols
        if sub["id_column"] not in cols or sub["prediction_column"] not in cols:
            res["problems"].append("expected columns %s,%s; found %s" % (sub["id_column"], sub["prediction_column"], cols))
            return res, 0.0
        if len(cols) != 2:
            res["problems"].append("extra columns present (only %s and %s are used)" % (sub["id_column"], sub["prediction_column"]))
        for row in reader:
            row = {(k or "").strip(): v for k, v in row.items() if k}
            v = parse(row.get(sub["prediction_column"], ""))
            if v is None:
                bad_values += 1
                continue
            preds[_norm_key(row[sub["id_column"]])] = v
    missing = [k for k in labels if k not in preds]
    extra = [k for k in preds if k not in labels]
    res.update(rows=len(preds), expected_rows=len(labels), missing_ids=len(missing), unknown_ids=len(extra),
               invalid_values=bad_values)
    if bad_values:
        res["problems"].append("%d predictions are not valid %s" % (bad_values, kind_desc))
    if kind == "class":
        unknown = sorted({v for v in preds.values()} - set(labels.values()))
        if unknown:
            res["problems"].append("unknown class names: %s" % ", ".join(unknown[:8]))
    if missing:
        res["problems"].append("%d test rows have no prediction (scored as a default)" % len(missing))
    if extra:
        res["problems"].append("%d ids are not in the test file (ignored)" % len(extra))
    y_true = [labels[k] for k in labels]
    default = fallback(y_true)
    y_pred = [preds.get(k, default) for k in labels]
    m = test["model"]
    res["metric"] = m["metric"]
    res["value"] = round(METRICS[m["metric"]](y_true, y_pred), 4)
    if kind in ("binary", "class"):
        res["accuracy"] = round(sum(t == p for t, p in zip(y_true, y_pred)) / len(y_true), 4)
    if kind == "binary":
        res["predicted_positive_rate"] = round(sum(y_pred) / len(y_pred), 4)
    frac = (res["value"] - m["floor"]) / (m["target"] - m["floor"])  # also right for rmse (target < floor)
    return res, max(0.0, min(1.0, frac))


def grade(test_id, values, submission_path):
    test_dir = os.path.join(TESTS_DIR, test_id)
    test = json.load(open(os.path.join(test_dir, "test.json")))
    answers = json.load(open(os.path.join(test_dir, "_hidden", "answers.json")))
    tasks, total, possible = [], 0.0, 0
    for t in test["tasks"]:
        possible += t["points"]
        if t.get("model"):
            detail, frac = grade_submission_csv(test, test_dir, submission_path)
            pts = round(t["points"] * frac, 1)
            tasks.append({"id": t["id"], "title": t["title"], "points": pts, "max": t["points"], "model": detail})
        else:
            checks = []
            for c in t["checks"]:
                ok, note = check_value(c["kind"], values.get(c["var"]), answers[c["var"]], c.get("tol", 0))
                checks.append({"var": c["var"], "passed": ok, "note": note})
            frac = sum(c["passed"] for c in checks) / len(checks)
            pts = round(t["points"] * frac, 1)
            tasks.append({"id": t["id"], "title": t["title"], "points": pts, "max": t["points"], "checks": checks})
        total += pts
    return {"test_id": test_id, "score": round(total, 1), "max_score": possible, "tasks": tasks}


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = os.path.abspath(sys.argv[1])
    meta = json.load(open(os.path.join(folder, "meta.json")))
    values = json.load(open(os.path.join(folder, "answers.json")))
    result = grade(meta["test_id"], values, os.path.join(folder, "submission.csv"))
    with open(os.path.join(folder, "grade.json"), "w") as f:
        json.dump(result, f, indent=1)
    print(json.dumps(result, indent=1))


if __name__ == "__main__":
    main()
