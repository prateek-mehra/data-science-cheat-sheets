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
    return False, "unknown check kind %s" % kind


def f1(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    return 0.0 if tp == 0 else 2 * tp / (2 * tp + fp + fn)


def _as_label(s):
    s = str(s).strip().lower()
    if s in ("1", "1.0", "true", "yes"):
        return 1
    if s in ("0", "0.0", "false", "no"):
        return 0
    return None


def grade_submission_csv(test, test_dir, path):
    sub = test["submission"]
    res = {"file_found": os.path.exists(path), "problems": []}
    if not res["file_found"]:
        res["problems"].append("submission.csv was not found in the working directory")
        return res, 0.0
    labels = {}
    with open(os.path.join(test_dir, sub["labels_file"]), newline="") as f:
        for row in csv.DictReader(f):
            labels[_norm_key(row[sub["id_column"]])] = int(row[sub["label_column"]])
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
            row = {k.strip(): v for k, v in row.items() if k}
            lab = _as_label(row[sub["prediction_column"]])
            if lab is None:
                bad_values += 1
                continue
            preds[_norm_key(row[sub["id_column"]])] = lab
    missing = [k for k in labels if k not in preds]
    extra = [k for k in preds if k not in labels]
    res.update(rows=len(preds), missing_ids=len(missing), unknown_ids=len(extra), non_binary_values=bad_values)
    if bad_values:
        res["problems"].append("%d predictions are not 0/1" % bad_values)
    if missing:
        res["problems"].append("%d test customers have no prediction (scored as 0)" % len(missing))
    if extra:
        res["problems"].append("%d ids are not in test.csv (ignored)" % len(extra))
    y_true = [labels[k] for k in labels]
    y_pred = [preds.get(k, 0) for k in labels]
    res["f1"] = round(f1(y_true, y_pred), 4)
    res["accuracy"] = round(sum(t == p for t, p in zip(y_true, y_pred)) / len(y_true), 4)
    res["predicted_positive_rate"] = round(sum(y_pred) / len(y_pred), 4)
    m = test["model"]
    frac = (res["f1"] - m["floor"]) / (m["target"] - m["floor"])
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
                ok, note = check_value(c["kind"], values.get(c["var"]), answers[c["var"]], c["tol"])
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
