#!/usr/bin/env python3
"""Local server for the cheat sheets that saves quiz rounds into the repo.

Run from anywhere:

    python3 tools/quiz_server.py

then open http://localhost:8000/quizzes/pandas-rapid-fire-quiz.html.

It serves the repository as static files and accepts one write:
POST /api/pandas-rounds with a finished round (or a list of rounds) as JSON.
Rounds are appended to quizzes/pandas-rounds.js, which
quizzes/pandas-quiz-reports.html loads to build its report cards.
Standard library only; binds to 127.0.0.1 so nothing outside this machine can reach it.
"""
import argparse
import json
import os
import tempfile
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROUNDS_FILE = os.path.join("quizzes", "pandas-rounds.js")
HEADER = (
    "// Pandas Rapid Fire rounds, written by tools/quiz_server.py when a round ends.\n"
    "// quizzes/pandas-quiz-reports.html builds a report card for each entry. Do not edit by hand.\n"
    "window.PANDAS_ROUNDS = "
)
MAX_BODY = 1_000_000
REQUIRED = ("date", "round", "score", "items")
LOCK = threading.Lock()


def read_rounds(root):
    path = os.path.join(root, ROUNDS_FILE)
    if not os.path.exists(path):
        return []
    text = open(path, encoding="utf-8").read()
    start, end = text.find("["), text.rfind("]")
    if start < 0 or end < start:
        return []
    return json.loads(text[start:end + 1])


def write_rounds(root, rounds):
    path = os.path.join(root, ROUNDS_FILE)
    body = HEADER + json.dumps(rounds, indent=1, ensure_ascii=False) + ";\n"
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(body)
    os.replace(tmp, path)


def valid_round(r):
    return isinstance(r, dict) and all(k in r for k in REQUIRED) and isinstance(r["items"], list)


def save_rounds(root, incoming):
    """Append new rounds (deduplicated by uid). Returns (rounds added, each incoming round's 1-based number)."""
    with LOCK:
        rounds = read_rounds(root)
        by_uid = {r.get("uid"): i + 1 for i, r in enumerate(rounds) if r.get("uid")}
        numbers, added = [], 0
        for r in incoming:
            uid = r.get("uid") or r["date"]
            r["uid"] = uid
            if uid not in by_uid:
                rounds.append(r)
                by_uid[uid] = len(rounds)
                added += 1
            numbers.append(by_uid[uid])
        if added:
            write_rounds(root, rounds)
        return added, numbers


class Handler(SimpleHTTPRequestHandler):
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

    def do_POST(self):
        if self.path != "/api/pandas-rounds":
            return self._json(404, {"error": "not found"})
        # Only accept writes from pages this server served (blocks other websites posting to localhost).
        origin = self.headers.get("Origin")
        host = self.headers.get("Host", "")
        if origin and origin not in ("http://" + host,):
            return self._json(403, {"error": "cross-origin request refused"})
        if "application/json" not in self.headers.get("Content-Type", ""):
            return self._json(415, {"error": "send application/json"})
        length = int(self.headers.get("Content-Length") or 0)
        if not 0 < length <= MAX_BODY:
            return self._json(413, {"error": "empty or too large"})
        try:
            payload = json.loads(self.rfile.read(length))
        except ValueError:
            return self._json(400, {"error": "invalid JSON"})
        incoming = payload if isinstance(payload, list) else [payload]
        if not incoming or not all(valid_round(r) for r in incoming):
            return self._json(400, {"error": "each round needs " + ", ".join(REQUIRED)})
        added, numbers = save_rounds(self.server.root, incoming)
        self._json(200, {"saved": added, "numbers": numbers})

    def log_message(self, fmt, *args):
        if self.command == "POST":
            super().log_message(fmt, *args)


def make_server(root, port):
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=root))
    server.root = root
    return server


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--root", default=REPO_ROOT, help="repository folder to serve and write into")
    ap.add_argument("--open", action="store_true", help="open the quiz in your browser")
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    if not os.path.exists(os.path.join(root, ROUNDS_FILE)):
        write_rounds(root, [])
    server = make_server(root, args.port)
    url = "http://localhost:%d/quizzes/pandas-rapid-fire-quiz.html" % args.port
    print("Serving %s\nQuiz:    %s\nReports: http://localhost:%d/quizzes/pandas-quiz-reports.html\nCtrl+C to stop."
          % (root, url, args.port))
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
