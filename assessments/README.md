# Data Science Framework practice

Timed notebook tests in the style of the CodeSignal Data Science Framework used in company assessments:
read a task, wrangle the data in a Python notebook, train a basic model and hand in `submission.csv` before the clock runs out.

## Run it (MacBook / any machine)

```bash
# once: a virtual environment with the data stack
python3 -m venv .venv && source .venv/bin/activate
pip install pandas numpy scikit-learn matplotlib

# every session, from the repository root
python3 tools/ds_assessment_server.py --open
```

That opens <http://localhost:8010/assessments/ds-framework.html>. Pick a test, read the rules, press **Start test**.
Everything runs locally: the server binds to 127.0.0.1 and cells execute in a Python subprocess using the
interpreter you started the server with (use `--python /path/to/python` to pick another).

## What the environment does

- **Task panel** (left) with the problem statement, and a **Files** tab to preview, download and upload files
  in the working directory. It shows whether `submission.csv` exists yet.
- **Notebook** (right): code and markdown cells, a persistent kernel, DataFrame tables, matplotlib plots,
  Tab autocomplete, run all, interrupt and restart. Shortcuts follow Jupyter (Shift+Enter, Esc then A/B/DD/M/Y).
- **Timer** in the top bar is kept by the server, so refreshing does not reset it. Warnings at 10, 5 and 1 minutes.
  At zero the notebook is submitted as it stands; if the page is closed, the server submits the last autosave.
- **Submit** reads the task variables from the live kernel, grades them and `submission.csv`, and saves:

```
assessments/submissions/<test-id>/<start time>/
  notebook.ipynb   the notebook as submitted (opens in Jupyter)
  submission.csv   your predictions
  answers.json     task variables captured from the kernel
  grade.json       auto-grade per task
  meta.json        start/submit time, time used, cells run, errors, package versions
  REVIEW.md        summary for a reviewer
```

Commit and push that folder, then ask Claude: *"Review my submission in assessments/submissions/…"*.
Re-grade a folder with `python3 tools/ds_grade.py <folder>`.

## Adding a test

Create `assessments/tests/<id>/` with:

- `test.json`: title, `duration_minutes`, `data_files`, `starter`, `task_html`, `submission` (file, id and
  prediction columns, hidden labels file), `tasks` (each with `points` and `checks` against variable names, or
  `"model": true`) and `model` (`metric`, `floor`, `target`: linear points between the two F1 values).
- `task.html`: the statement shown in the task panel. `starter.ipynb`: the starting notebook.
- `data/`: the files copied into the working directory.
- `_hidden/`: `answers.json`, the test labels, and the generator / reference solution. The server never serves
  `_hidden/`, though it is in the repo, so don't open it before you take the test.

The sample test, `fresh-crate-churn` (60 min), uses a synthetic dataset from
`_hidden/make_data.py`; its reference logistic regression scores F1 ≈ 0.70 on the hidden labels.

`vendor/codemirror/` is CodeMirror 5.65.16 (MIT), kept locally so the editor works offline.
