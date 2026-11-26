#!/usr/bin/env python3
"""Local server for the timed Data Science Framework practice tests.

    python3 tools/ds_assessment_server.py --open

then work in http://localhost:8010/assessments/ds-framework.html.

Run it with the Python that has pandas, numpy, scikit-learn and matplotlib installed
(or pass --python /path/to/that/python): notebook cells execute in a kernel
subprocess started with that interpreter, in a fresh working directory per attempt
(assessments/attempts/<id>/, git-ignored) holding copies of the test's data files.

The timer lives on the server: refreshing the page does not reset it. When time runs
out the page auto-submits; if the page is closed, the server submits the last
autosaved notebook itself. Each submission is written to
assessments/submissions/<test-id>/<stamp>/ (notebook.ipynb, submission.csv,
answers.json, grade.json, meta.json, REVIEW.md) for review.

Standard library only; binds to 127.0.0.1 and refuses requests from other origins.
"""
import argparse
import datetime as dt
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ds_grade  # noqa: E402

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSESS = os.path.join(REPO_ROOT, "assessments")
TESTS_DIR = os.path.join(ASSESS, "tests")
ATTEMPTS_DIR = os.path.join(ASSESS, "attempts")
SUBMISSIONS_DIR = os.path.join(ASSESS, "submissions")
CURRENT_FILE = os.path.join(ATTEMPTS_DIR, "current.json")
WORKER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ds_kernel_worker.py")
MAX_BODY = 50_000_000
AUTO_SUBMIT_GRACE = 15  # seconds after the deadline before the server submits on its own
SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._ -]{0,120}$")


def now():
    return time.time()


def iso(t):
    return dt.datetime.fromtimestamp(t).astimezone().isoformat(timespec="seconds")


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def write_json(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
    os.replace(tmp, path)


def load_tests():
    tests = []
    for name in sorted(os.listdir(TESTS_DIR)):
        t = read_json(os.path.join(TESTS_DIR, name, "test.json"))
        if t:
            tests.append(t)
    return tests


def load_test(test_id):
    if not SAFE_NAME.match(test_id or ""):
        return None
    return read_json(os.path.join(TESTS_DIR, test_id, "test.json"))


# --------------------------------------------------------------------------- kernel
class Kernel:
    def __init__(self, python):
        self.python = python
        self.proc = None
        self.lock = threading.Lock()  # one request at a time
        self.busy = False
        self.info = {}
        self.cwd = None

    def start(self, cwd):
        self.stop()
        self.cwd = cwd
        env = dict(os.environ, MPLBACKEND="Agg", PYTHONUNBUFFERED="1", PYTHONIOENCODING="utf-8")
        self.proc = subprocess.Popen([self.python, "-u", WORKER], cwd=cwd, env=env, text=True,
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, encoding="utf-8")
        line = self.proc.stdout.readline()
        self.info = json.loads(line) if line else {}
        self.info["started"] = now()
        if not line:
            raise RuntimeError("kernel failed to start with %s" % self.python)
        env_reply = self.request({"op": "env"})
        self.info.update(env_reply.get("env", {}) if env_reply.get("ok") else {})

    def alive(self):
        return self.proc is not None and self.proc.poll() is None

    def stop(self):
        p, self.proc = self.proc, None
        if p and p.poll() is None:
            p.kill()
            try:
                p.wait(5)
            except subprocess.TimeoutExpired:
                pass

    def request(self, msg, blocking=True):
        if not self.lock.acquire(blocking):
            return {"ok": False, "error": "busy"}
        try:
            proc = self.proc
            if proc is None or proc.poll() is not None:
                return {"ok": False, "error": "dead", "message": "The kernel is not running. Restart it."}
            self.busy = msg.get("op") == "execute"
            try:
                proc.stdin.write(json.dumps(msg) + "\n")
                proc.stdin.flush()
                line = proc.stdout.readline()
            except (BrokenPipeError, OSError, ValueError):
                line = ""
            if not line:
                return {"ok": False, "error": "dead",
                        "message": "The kernel died (restarted, killed or out of memory). Restart it and re-run your cells."}
            return json.loads(line)
        finally:
            self.busy = False
            self.lock.release()

    def interrupt(self):
        if self.alive() and self.busy:
            os.kill(self.proc.pid, signal.SIGINT)
            return True
        return False


# --------------------------------------------------------------------------- attempts
class Manager:
    def __init__(self, python):
        self.python = python
        self.kernel = Kernel(python)
        self.lock = threading.RLock()
        self.attempt = None
        cur = read_json(CURRENT_FILE)
        if cur and cur.get("status") == "running":
            self.attempt = cur
            self.attempt["kernel_restarted_by_server"] = True
            try:
                self.kernel.start(self.workspace())
            except Exception as e:  # noqa: BLE001
                print("Could not start kernel:", e)

    def workspace(self):
        return os.path.join(ATTEMPTS_DIR, self.attempt["attempt_id"])

    def persist(self):
        write_json(CURRENT_FILE, self.attempt)

    def remaining(self):
        return max(0.0, self.attempt["deadline"] - now()) if self.attempt else 0.0

    def running(self):
        return bool(self.attempt and self.attempt.get("status") == "running")

    def state(self):
        if not self.running():
            return {"active": None}
        a = dict(self.attempt)
        a["remaining_seconds"] = self.remaining()
        a["server_time"] = now()
        a["kernel_alive"] = self.kernel.alive()
        a["kernel"] = self.kernel.info
        a["notebook"] = read_json(os.path.join(self.workspace(), "notebook.ipynb"))
        return {"active": a}

    def start(self, test_id, duration_minutes=None):
        with self.lock:
            if self.running():
                raise ValueError("An attempt is already running. Submit it first.")
            test = load_test(test_id)
            if not test:
                raise ValueError("Unknown test %r" % test_id)
            options = test.get("duration_options") or [test["duration_minutes"]]
            minutes = int(duration_minutes or test["duration_minutes"])
            if minutes not in options and minutes != test["duration_minutes"]:
                raise ValueError("Duration must be one of %s minutes" % options)
            stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
            attempt_id = "%s-%s" % (test_id, stamp)
            ws = os.path.join(ATTEMPTS_DIR, attempt_id)
            os.makedirs(ws, exist_ok=True)
            tdir = os.path.join(TESTS_DIR, test_id)
            for f in test["data_files"]:
                shutil.copy2(os.path.join(tdir, "data", f), os.path.join(ws, f))
            shutil.copy2(os.path.join(tdir, test["starter"]), os.path.join(ws, "notebook.ipynb"))
            started = now()
            self.attempt = {"attempt_id": attempt_id, "test_id": test_id, "title": test["title"],
                            "status": "running", "started_at": started, "started_iso": iso(started),
                            "duration_seconds": minutes * 60, "standard_minutes": test["duration_minutes"],
                            "deadline": started + minutes * 60,
                            "cells_run": 0, "errors": 0, "uploads": []}
            self.persist()
            self.kernel.start(ws)
            return self.state()

    def check_time(self):
        if not self.running():
            raise PermissionError("No attempt is running.")
        if self.remaining() <= 0:
            raise PermissionError("Time is up.")

    def execute(self, code):
        self.check_time()
        reply = self.kernel.request({"op": "execute", "code": code})
        with self.lock:
            if self.attempt:
                self.attempt["cells_run"] += 1
                if any(o.get("output_type") == "error" for o in reply.get("outputs", [])) or not reply.get("ok"):
                    self.attempt["errors"] += 1
                self.persist()
        return reply

    def save_notebook(self, nb):
        if not self.running():
            raise PermissionError("No attempt is running.")
        if not isinstance(nb, dict) or "cells" not in nb:
            raise ValueError("Not a notebook")
        write_json(os.path.join(self.workspace(), "notebook.ipynb"), nb)

    def files(self):
        ws = self.workspace()
        out = []
        for name in sorted(os.listdir(ws)):
            p = os.path.join(ws, name)
            if os.path.isfile(p) and not name.endswith(".tmp"):
                st = os.stat(p)
                out.append({"name": name, "size": st.st_size, "mtime": st.st_mtime})
        return out

    def file_path(self, name):
        if not self.running() or not SAFE_NAME.match(name or "") or "/" in name or ".." in name:
            return None
        p = os.path.join(self.workspace(), name)
        return p if os.path.isfile(p) else None

    def upload(self, name, data):
        self.check_time()
        if not SAFE_NAME.match(name or "") or "/" in name or ".." in name:
            raise ValueError("Bad file name")
        with open(os.path.join(self.workspace(), name), "wb") as f:
            f.write(data)
        with self.lock:
            self.attempt["uploads"].append({"name": name, "at": iso(now()), "bytes": len(data)})
            self.persist()

    def submit(self, nb=None, reason="manual"):
        with self.lock:
            if not self.running():
                raise PermissionError("No attempt is running.")
            a = self.attempt
            ws = self.workspace()
            if nb is not None:
                try:
                    self.save_notebook(nb)
                except ValueError:
                    pass
            test = load_test(a["test_id"])
            names = [c["var"] for t in test["tasks"] for c in t.get("checks", [])]
            # a cell still running at the deadline is interrupted so variables can be read
            if self.kernel.busy:
                self.kernel.interrupt()
                for _ in range(30):
                    if not self.kernel.busy:
                        break
                    time.sleep(0.1)
            values = {}
            kernel_state = "not running"
            if self.kernel.alive():
                r = self.kernel.request({"op": "inspect", "names": names}, blocking=False)
                if r.get("ok"):
                    values, kernel_state = r["values"], "alive"
                else:
                    kernel_state = "busy (could not read variables)"
            submitted = now()
            elapsed = min(submitted, a["deadline"]) - a["started_at"]
            stamp = dt.datetime.fromtimestamp(a["started_at"]).strftime("%Y-%m-%d_%H%M%S")
            out = os.path.join(SUBMISSIONS_DIR, a["test_id"], stamp)
            os.makedirs(out, exist_ok=True)
            shutil.copy2(os.path.join(ws, "notebook.ipynb"), os.path.join(out, "notebook.ipynb"))
            sub_src = os.path.join(ws, test["submission"]["file"])
            if os.path.exists(sub_src):
                shutil.copy2(sub_src, os.path.join(out, "submission.csv"))
            write_json(os.path.join(out, "answers.json"), values)
            try:
                grade = ds_grade.grade(a["test_id"], values, os.path.join(out, "submission.csv"))
            except Exception as e:  # noqa: BLE001 - never lose a submission to a grader bug
                grade = {"test_id": a["test_id"], "score": 0, "max_score": sum(t["points"] for t in test["tasks"]),
                         "tasks": [], "error": "grader failed: %r (re-grade with tools/ds_grade.py)" % e}
            write_json(os.path.join(out, "grade.json"), grade)
            data_files = set(test["data_files"]) | {"notebook.ipynb"}
            meta = {
                "test_id": a["test_id"], "title": a["title"], "attempt_id": a["attempt_id"],
                "started": iso(a["started_at"]), "submitted": iso(submitted),
                "reason": reason, "duration_limit_seconds": a["duration_seconds"],
                "standard_duration_seconds": a.get("standard_minutes", a["duration_seconds"] // 60) * 60,
                "elapsed_seconds": round(elapsed), "time_left_seconds": round(max(0, a["deadline"] - submitted)),
                "cells_run": a["cells_run"], "cells_with_errors": a["errors"],
                "uploads": a["uploads"], "kernel_at_submit": kernel_state,
                "kernel_env": self.kernel.info,
                "other_files": [f["name"] for f in self.files() if f["name"] not in data_files],
                "score": grade["score"], "max_score": grade["max_score"],
            }
            write_json(os.path.join(out, "meta.json"), meta)
            with open(os.path.join(out, "AUTOGRADE.md"), "w", encoding="utf-8") as f:
                f.write(review_md(meta, grade))
            self.kernel.stop()
            a["status"] = "submitted"
            a["submission_dir"] = os.path.relpath(out, REPO_ROOT)
            self.persist()
            self.attempt = None
            return {"submission_dir": os.path.relpath(out, REPO_ROOT), "meta": meta, "grade": grade}

    def watch(self):
        while True:
            time.sleep(2)
            try:
                if self.running() and now() > self.attempt["deadline"] + AUTO_SUBMIT_GRACE:
                    r = self.submit(None, reason="timeout (server auto-submit; page was not open)")
                    print("Auto-submitted:", r["submission_dir"])
            except Exception as e:  # noqa: BLE001
                print("auto-submit failed:", e)


def fmt_secs(s):
    s = int(round(s))
    return "%d:%02d:%02d" % (s // 3600, s % 3600 // 60, s % 60)


def review_md(meta, grade):
    lines = ["# %s — auto-grade" % meta["title"], "",
             "| | |", "|---|---|",
             "| Test | `%s` |" % meta["test_id"],
             "| Started | %s |" % meta["started"],
             "| Submitted | %s (%s) |" % (meta["submitted"], meta["reason"]),
             "| Time used | %s of %s |" % (fmt_secs(meta["elapsed_seconds"]), fmt_secs(meta["duration_limit_seconds"])),
             "| Cells run | %d (%d with errors) |" % (meta["cells_run"], meta["cells_with_errors"]),
             "| Auto score | **%s / %s** |" % (grade["score"], grade["max_score"]), "",
             "## Auto-graded results", ""]
    for t in grade["tasks"]:
        lines.append("### Task %s · %s — %s / %s" % (t["id"], t["title"], t["points"], t["max"]))
        for c in t.get("checks", []):
            lines.append("- %s `%s` %s" % ("✅" if c["passed"] else "❌", c["var"], c["note"]))
        m = t.get("model")
        if m is not None:
            if "value" in m:
                lines.append("- %s: %s" % (m["metric"], m["value"]))
            for k in ("accuracy", "predicted_positive_rate", "rows", "expected_rows", "missing_ids", "invalid_values"):
                if k in m:
                    lines.append("- %s: %s" % (k, m[k]))
            for p in m.get("problems", []):
                lines.append("- ⚠️ %s" % p)
        lines.append("")
    lines += ["## For the reviewer", "",
              "Read `notebook.ipynb` and assess, beyond the auto score: correctness of the cleaning and joins, "
              "leakage (fitting on test, using the label in features), validation approach, feature choices, "
              "code clarity, and any written interpretation. Variables captured from the kernel are in `answers.json`. "
              "Write the review to `REVIEW.md` in this folder; the practice page then shows it and reveals the score.", ""]
    return "\n".join(lines)


def submission_detail(key):
    parts = (key or "").split("/")
    if len(parts) != 2 or not all(SAFE_NAME.match(p) and ".." not in p for p in parts):
        return None
    d = os.path.join(SUBMISSIONS_DIR, *parts)
    meta = read_json(os.path.join(d, "meta.json"))
    if not meta:
        return None
    review = None
    if os.path.exists(os.path.join(d, "REVIEW.md")):
        with open(os.path.join(d, "REVIEW.md"), encoding="utf-8") as f:
            review = f.read()
    return {"meta": meta, "grade": read_json(os.path.join(d, "grade.json")), "review": review,
            "submission_dir": os.path.relpath(d, REPO_ROOT)}


def history():
    out = []
    if not os.path.isdir(SUBMISSIONS_DIR):
        return out
    for test_id in sorted(os.listdir(SUBMISSIONS_DIR)):
        d = os.path.join(SUBMISSIONS_DIR, test_id)
        if not os.path.isdir(d):
            continue
        for stamp in sorted(os.listdir(d)):
            meta = read_json(os.path.join(d, stamp, "meta.json"))
            if meta:
                meta["dir"] = os.path.relpath(os.path.join(d, stamp), REPO_ROOT)
                meta["key"] = "%s/%s" % (test_id, stamp)
                meta["reviewed"] = os.path.exists(os.path.join(d, stamp, "REVIEW.md"))
                out.append(meta)
    out.sort(key=lambda m: m.get("started", ""), reverse=True)
    return out


# --------------------------------------------------------------------------- http
class Handler(SimpleHTTPRequestHandler):
    manager = None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _host_ok(self):
        host = self.headers.get("Host", "").split(":")[0]
        return host in ("localhost", "127.0.0.1")

    def _origin_ok(self):
        origin = self.headers.get("Origin")
        return not origin or origin == "http://" + self.headers.get("Host", "")

    def _body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if not 0 <= length <= MAX_BODY:
            raise ValueError("body too large")
        return self.rfile.read(length) if length else b""

    def do_GET(self):
        if not self._host_ok():
            return self._json(403, {"error": "bad host"})
        url = urlparse(self.path)
        path = url.path
        plain = unquote(path).replace("\\", "/")
        if "_hidden" in plain or "/attempts" in plain or ".." in plain:
            return self._json(403, {"error": "not served"})
        if not path.startswith("/api/ds/"):
            return super().do_GET()
        m = self.manager
        q = parse_qs(url.query)
        if path == "/api/ds/tests":
            return self._json(200, {"tests": load_tests(), "python": m.python})
        if path == "/api/ds/state":
            return self._json(200, m.state())
        if path == "/api/ds/history":
            return self._json(200, {"submissions": history()})
        if path == "/api/ds/task":
            test = load_test(q.get("test", [""])[0])
            if not test:
                return self._json(404, {"error": "unknown test"})
            with open(os.path.join(TESTS_DIR, test["id"], test["task_html"]), encoding="utf-8") as f:
                return self._json(200, {"html": f.read()})
        if path == "/api/ds/submission":
            detail = submission_detail(q.get("key", [""])[0])
            return self._json(200, detail) if detail else self._json(404, {"error": "no such submission"})
        if path == "/api/ds/files":
            if not m.running():
                return self._json(200, {"files": []})
            return self._json(200, {"files": m.files()})
        if path == "/api/ds/file":
            name = q.get("name", [""])[0]
            p = m.file_path(name)
            if not p:
                return self._json(404, {"error": "no such file"})
            if q.get("download"):
                with open(p, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Disposition", 'attachment; filename="%s"' % name)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            with open(p, "rb") as f:
                head = f.read(64_000)
            text = head.decode("utf-8", errors="replace")
            lines = text.splitlines()[:40]
            return self._json(200, {"name": name, "preview": "\n".join(lines), "size": os.path.getsize(p)})
        return self._json(404, {"error": "not found"})

    def do_POST(self):
        if not self._host_ok() or not self._origin_ok():
            return self._json(403, {"error": "cross-origin request refused"})
        path = urlparse(self.path).path
        m = self.manager
        try:
            if path == "/api/ds/upload":
                name = self.headers.get("X-Filename", "")
                m.upload(name, self._body())
                return self._json(200, {"files": m.files()})
            if "application/json" not in self.headers.get("Content-Type", ""):
                return self._json(415, {"error": "send application/json"})
            raw = self._body()
            payload = json.loads(raw) if raw else {}
            if path == "/api/ds/start":
                return self._json(200, m.start(payload.get("test_id"), payload.get("duration_minutes")))
            if path == "/api/ds/execute":
                return self._json(200, m.execute(payload.get("code", "")))
            if path == "/api/ds/complete":
                if not m.running():
                    return self._json(200, {"ok": True, "matches": []})
                return self._json(200, m.kernel.request({"op": "complete", "code": payload.get("code", ""),
                                                        "pos": payload.get("pos", 0)}, blocking=False))
            if path == "/api/ds/interrupt":
                return self._json(200, {"interrupted": m.kernel.interrupt()})
            if path == "/api/ds/restart":
                m.check_time()
                m.kernel.stop()
                m.kernel.start(m.workspace())
                return self._json(200, {"ok": True, "kernel": m.kernel.info})
            if path == "/api/ds/save":
                m.save_notebook(payload.get("notebook"))
                return self._json(200, {"ok": True, "saved_at": now()})
            if path == "/api/ds/submit":
                return self._json(200, m.submit(payload.get("notebook"), payload.get("reason", "manual")))
        except PermissionError as e:
            return self._json(409, {"error": str(e)})
        except (ValueError, RuntimeError) as e:
            return self._json(400, {"error": str(e)})
        return self._json(404, {"error": "not found"})

    def log_message(self, fmt, *args):
        if self.command == "POST" and "/api/ds/save" not in self.path and "/api/ds/complete" not in self.path:
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--port", type=int, default=8010)
    ap.add_argument("--python", default=sys.executable,
                    help="interpreter for the notebook kernel (needs pandas, scikit-learn, matplotlib)")
    ap.add_argument("--open", action="store_true", help="open the test lobby in your browser")
    args = ap.parse_args()
    os.makedirs(ATTEMPTS_DIR, exist_ok=True)
    os.makedirs(SUBMISSIONS_DIR, exist_ok=True)
    check = subprocess.run([args.python, "-c", "import pandas, sklearn, numpy"], capture_output=True, text=True)
    if check.returncode:
        print("WARNING: %s cannot import pandas/numpy/scikit-learn. Install them:\n"
              "    %s -m pip install pandas numpy scikit-learn matplotlib\n" % (args.python, args.python))
    Handler.manager = Manager(args.python)
    threading.Thread(target=Handler.manager.watch, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=REPO_ROOT))
    server.daemon_threads = True
    url = "http://localhost:%d/assessments/ds-framework.html" % args.port
    print("Data Science Framework practice\n  Open:        %s\n  Kernel:      %s\n  Submissions: %s\nCtrl+C to stop."
          % (url, args.python, os.path.relpath(SUBMISSIONS_DIR, os.getcwd())))
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        Handler.manager.kernel.stop()


if __name__ == "__main__":
    main()
