#!/usr/bin/env python3
"""A tiny notebook kernel, run as a subprocess by tools/ds_assessment_server.py.

Protocol: one JSON object per line on stdin; one JSON reply per line on the
original stdout (fd 1 is redirected to stderr so stray C-level prints can't
corrupt the channel).

  {"op": "execute", "code": "..."}       -> {"ok": true, "outputs": [...], "count": n}
  {"op": "complete", "code": "...", "pos": n} -> {"ok": true, "matches": [...], "start": n}
  {"op": "inspect", "names": [...]}      -> {"ok": true, "values": {...}}
  {"op": "env"}                          -> {"ok": true, "env": {package: version}}

Outputs follow the Jupyter shape: stream (stdout/stderr), execute_result /
display_data (text/plain, text/html, image/png) and error (ename, evalue, traceback).
SIGINT interrupts the running cell (KeyboardInterrupt), as in Jupyter.
"""
import ast
import base64
import io
import json
import math
import os
import re
import sys
import traceback

os.environ.setdefault("MPLBACKEND", "Agg")

PROTO = os.fdopen(os.dup(1), "w", buffering=1, encoding="utf-8")
os.dup2(2, 1)
REAL_STDERR = sys.stderr

NS = {"__name__": "__main__", "__builtins__": __builtins__}
COUNT = 0
OUTPUTS = []
MAX_TEXT = 200_000


def emit_stream(name, text):
    if not text:
        return
    if OUTPUTS and OUTPUTS[-1].get("output_type") == "stream" and OUTPUTS[-1]["name"] == name:
        OUTPUTS[-1]["text"] += text
    else:
        OUTPUTS.append({"output_type": "stream", "name": name, "text": text})
    if len(OUTPUTS[-1]["text"]) > MAX_TEXT:
        OUTPUTS[-1]["text"] = OUTPUTS[-1]["text"][:MAX_TEXT] + "\n... [output truncated]\n"


class Capture(io.TextIOBase):
    def __init__(self, name):
        self.name = name

    def writable(self):
        return True

    def write(self, s):
        emit_stream(self.name, s)
        return len(s)

    def flush(self):
        pass

    def isatty(self):
        return False


def mime_bundle(obj):
    data = {}
    try:
        if hasattr(obj, "_repr_html_") and not isinstance(obj, type):
            html = obj._repr_html_()
            if html:
                data["text/html"] = html
    except Exception:
        pass
    try:
        if hasattr(obj, "_repr_png_") and not isinstance(obj, type):
            png = obj._repr_png_()
            if png:
                data["image/png"] = base64.b64encode(png).decode() if isinstance(png, bytes) else png
    except Exception:
        pass
    try:
        data["text/plain"] = repr(obj)
    except Exception as e:
        data["text/plain"] = "<unrepresentable %s: %s>" % (type(obj).__name__, e)
    return data


def display(*objs, **_):
    for obj in objs:
        OUTPUTS.append({"output_type": "display_data", "data": mime_bundle(obj), "metadata": {}})


NS["display"] = display


def flush_figures():
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return
    for num in plt.get_fignums():
        fig = plt.figure(num)
        buf = io.BytesIO()
        try:
            fig.savefig(buf, format="png", bbox_inches="tight", dpi=100)
            OUTPUTS.append({"output_type": "display_data", "metadata": {},
                            "data": {"image/png": base64.b64encode(buf.getvalue()).decode(),
                                     "text/plain": "<Figure>"}})
        except Exception as e:
            emit_stream("stderr", "Could not render figure: %s\n" % e)
    plt.close("all")


def strip_magics(code):
    """Drop IPython-only lines (%matplotlib inline, !pip ...) so starter cells still run."""
    out = []
    for line in code.split("\n"):
        s = line.strip()
        if s.startswith("%") or s.startswith("!"):
            out.append("")  # keep line numbers stable
        else:
            out.append(line)
    return "\n".join(out)


def run_cell(code):
    global COUNT
    COUNT += 1
    filename = "<cell %d>" % COUNT
    code = strip_magics(code)
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = Capture("stdout"), Capture("stderr")
    try:
        tree = ast.parse(code, filename, "exec")
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, filename, "exec"), NS)
        if last is not None:
            value = eval(compile(last, filename, "eval"), NS)
            if value is not None:
                NS["_"] = value
                # a bare figure/axes expression is shown by flush_figures instead
                mod = type(value).__module__ or ""
                if not mod.startswith("matplotlib"):
                    OUTPUTS.append({"output_type": "execute_result", "execution_count": COUNT,
                                    "data": mime_bundle(value), "metadata": {}})
    except BaseException as e:  # includes KeyboardInterrupt and SystemExit
        tb = traceback.format_exception(type(e), e, e.__traceback__)
        # hide this worker's frames
        tb = [t for t in tb if "ds_kernel_worker.py" not in t]
        OUTPUTS.append({"output_type": "error", "ename": type(e).__name__, "evalue": str(e), "traceback": tb})
    finally:
        try:
            flush_figures()
        except BaseException:
            pass
        sys.stdout, sys.stderr = old_out, old_err


def complete(code, pos):
    import rlcompleter
    m = re.search(r"[A-Za-z_][\w.]*$|\.$", code[:pos])
    token = m.group(0) if m else ""
    start = pos - len(token)
    if not token:
        return [], start
    c = rlcompleter.Completer(NS)
    matches, i = [], 0
    try:
        while len(matches) < 200:
            r = c.complete(token, i)
            if r is None:
                break
            matches.append(r.rstrip("("))
            i += 1
    except Exception:
        pass
    seen, uniq = set(), []
    for x in matches:
        if x not in seen and not x.rsplit(".", 1)[-1].startswith("__"):
            seen.add(x)
            uniq.append(x)
    return uniq, start


def to_jsonable(v, depth=0):
    if depth > 4:
        return repr(v)[:500]
    try:
        import numpy as np
        if isinstance(v, np.generic):
            v = v.item()
        elif isinstance(v, np.ndarray):
            v = v.tolist()[:1000]
    except ImportError:
        pass
    try:
        import pandas as pd
        if isinstance(v, pd.Series):
            v = {str(k): x for k, x in list(v.items())[:1000]}
        elif isinstance(v, pd.DataFrame):
            return {"__dataframe__": True, "shape": list(v.shape), "head": v.head(20).to_dict(orient="split")}
    except ImportError:
        pass
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    if isinstance(v, dict):
        return {str(k): to_jsonable(x, depth + 1) for k, x in list(v.items())[:1000]}
    if isinstance(v, (list, tuple, set)):
        return [to_jsonable(x, depth + 1) for x in list(v)[:1000]]
    return repr(v)[:500]


def inspect(names):
    out = {}
    for n in names:
        if n in NS:
            try:
                out[n] = to_jsonable(NS[n])
                json.dumps(out[n])
            except Exception:
                out[n] = repr(NS[n])[:500]
    return out


def versions():
    out = {}
    for mod in ("pandas", "numpy", "sklearn", "matplotlib", "scipy", "xgboost", "lightgbm"):
        try:
            out[mod] = __import__(mod).__version__
        except Exception:
            pass
    return out


def main():
    global OUTPUTS
    PROTO.write(json.dumps({"ready": True, "pid": os.getpid(), "python": sys.version.split()[0]}) + "\n")
    while True:
        try:
            line = sys.stdin.readline()
        except KeyboardInterrupt:
            continue  # interrupt while idle: ignore
        if not line:
            break
        try:
            msg = json.loads(line)
        except ValueError:
            continue
        op = msg.get("op")
        try:
            if op == "execute":
                OUTPUTS = []
                run_cell(msg.get("code", ""))
                reply = {"ok": True, "outputs": OUTPUTS, "count": COUNT}
            elif op == "complete":
                matches, start = complete(msg.get("code", ""), int(msg.get("pos", 0)))
                reply = {"ok": True, "matches": matches, "start": start}
            elif op == "env":
                reply = {"ok": True, "env": versions()}
            elif op == "inspect":
                reply = {"ok": True, "values": inspect(msg.get("names", []))}
            else:
                reply = {"ok": False, "error": "unknown op"}
        except KeyboardInterrupt:
            reply = {"ok": True, "outputs": OUTPUTS + [{"output_type": "error", "ename": "KeyboardInterrupt",
                                                       "evalue": "", "traceback": ["KeyboardInterrupt\n"]}],
                     "count": COUNT}
        try:
            PROTO.write(json.dumps(reply) + "\n")
        except (TypeError, ValueError) as e:
            PROTO.write(json.dumps({"ok": False, "error": "could not serialise reply: %s" % e}) + "\n")


if __name__ == "__main__":
    main()
