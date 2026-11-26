#!/usr/bin/env python3
"""Checks quizzes/python-question-bank.js: runs every "What does this print?" snippet and confirms
that its printed output (lines joined by spaces), or the name of the exception it raises, equals
accept[0]. Also checks ids are unique and reports the difficulty and stage mix.

    python3 tools/check_python_bank.py

Snippets come from this repo's own bank and are run in a fresh namespace with stdout captured.
"""
import collections
import contextlib
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(ROOT, "quizzes", "python-question-bank.js")


def load():
    text = open(BANK, encoding="utf-8").read()
    body = text[text.index("window.PYTHON_BANK =") + len("window.PYTHON_BANK ="):].strip().rstrip(";")
    return json.loads(body)


def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {})
    except Exception as e:  # the answer to a snippet that raises is the exception's name
        return type(e).__name__
    return " ".join(buf.getvalue().split("\n")).strip()


def main():
    bank = load()
    problems = []
    ids = collections.Counter(q["id"] for q in bank)
    problems += ["duplicate id %s" % i for i, n in ids.items() if n > 1]
    for q in bank:
        if q["kind"] == "out":
            got = run(q["code"])
            if got != q["accept"][0]:
                problems.append("%s: prints %r, bank says %r" % (q["id"], got, q["accept"][0]))
    mix = collections.Counter(q["difficulty"] for q in bank)
    print("%d questions · " % len(bank) + " · ".join("%s %d (%d%%)" % (d, mix[d], round(100 * mix[d] / len(bank)))
                                                     for d in ("easy", "medium", "hard")))
    print("stages: " + ", ".join("%s %d" % kv for kv in collections.Counter(q["stage"] for q in bank).items()))
    for p in problems:
        print("PROBLEM", p)
    print("OK" if not problems else "%d problem(s)" % len(problems))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
