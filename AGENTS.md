# Repository instructions

## Quiz report maintenance

- Keep the quiz reports section in [index.html](index.html) linked to [quizzes/quiz-reports.html](quizzes/quiz-reports.html), [quizzes/python-quiz-reports.html](quizzes/python-quiz-reports.html) and [quizzes/pandas-quiz-reports.html](quizzes/pandas-quiz-reports.html).
- After each quiz, add a new collapsible card to [quizzes/quiz-reports.html](quizzes/quiz-reports.html): a `<section id="quiz-NNN">` holding a `<details class="card">`. Its `<summary>` holds the quiz name as `<h2>` and a one-line `.meta` with date, questions, attempted, accuracy and score; the full report goes inside the card. Preserve all earlier quiz cards.
- Every quiz report must include these sections: **Strengths**, **Weaknesses**, and **Learnings from weaknesses**.
- Make the question-by-question list under **Learnings from weaknesses** collapsible with a clear summary label. For every wrong answer, include the exact question wording, code snippet, and all answer choices as shown in the quiz, plus the learner's answer, correct result, and concept learned.
- Base strengths and weaknesses on the quiz responses. Do not infer mastery from skipped or unanswered questions.
- Record the quiz date, quiz/topic name, total questions, attempted questions, correct, wrong, skipped or unanswered, accuracy among attempted questions, accuracy across all questions, and net score using +1 for correct, 0 for skip, and −1 for wrong.
- Include the quiz duration and per-question time limits when known. If exact elapsed time or a metric is unknown, label it as unknown instead of estimating.
- Check that the `#quiz-NNN` link opens the matching card, the index still links to the report page, and all report sections are present.

## Python fundamentals quiz design and delivery

- A full Python fundamentals quiz contains 30 questions: 14 medium (about 50%), 7 easy (25%), and 7 hard (25%).
- For a shorter quiz, scale the mix as closely as possible while keeping the same proportions. For a 10-question quiz, use 5 medium, 2 easy, and 3 hard questions.
- Assign a per-question time limit in seconds based on difficulty. Use 20 seconds for easy, 35 seconds for medium, and 60 seconds for hard unless a quiz requires a documented adjustment.
- Show a live countdown timer alongside each question. Start or reset it when the question appears. When time expires, record the question as unanswered and continue.
- Do not show the topic name, difficulty, category label, or any hint alongside a question. Present only the question, code or context needed to answer it, answer choices, and timer.
- Track question difficulty internally for quiz balancing and reporting. Do not use difficulty labels to give away answers during delivery.
- Record the per-question time limits and actual total duration in the report when available; otherwise mark unknown.

## Pandas rapid fire quiz

- The quiz lives at [quizzes/pandas-rapid-fire-quiz.html](quizzes/pandas-rapid-fire-quiz.html). Each answer is one typed line of pandas, graded against accepted forms. There are no answer choices.
- The question bank lives in [quizzes/pandas-question-bank.js](quizzes/pandas-question-bank.js) (200 questions). Its header explains the `Q(...)` format. Write original questions; don't copy them from other sites.
- The question bank covers every data wrangling stage: load, inspect, select/filter, clean, transform, reshape, combine, aggregate, time series and export. Tag each question with its `stage` and `difficulty`. Neither is shown during delivery.
- Keep the bank's difficulty mix at about 25% easy, 50% medium and 25% hard. A lightning round samples 1 easy, 3 medium and 1 hard; a quick round 2 easy, 5 medium and 3 hard; a full round 7 easy, 15 medium and 8 hard (30). Within that mix, each pick comes from the least-used stage, so short rounds cover as many stages as possible. Time limits are 20s, 35s and 60s as above.
- When adding a question, list every reasonable correct form in `accept` (or `acceptRegex`, written against the normalised answer), put the most idiomatic form first (it is shown as the answer), and check that an obviously wrong answer is rejected and that no other question's answers are accepted.
- Rounds are recorded automatically into the repo. Play through the local save server (`python3 tools/quiz_server.py`, then open http://localhost:8000/quizzes/pandas-rapid-fire-quiz.html). When a round ends, the quiz POSTs it to the server, which appends it to [quizzes/pandas-rounds.js](quizzes/pandas-rounds.js). [quizzes/pandas-quiz-reports.html](quizzes/pandas-quiz-reports.html) builds a `<section id="pandas-NNN">` card for each entry, following the quiz report rules above: metrics, duration, limits, Strengths, Weaknesses, and collapsible Learnings from weaknesses. Rounds finished without the server wait in browser storage and are sent the next time the quiz is opened through it.
- Don't hand-write pandas report cards or edit `pandas-rounds.js` by hand; commit it like any other file. If the report format changes, update the renderer script on the reports page and the fields the quiz saves in `saveHistory()`.
- Link the pandas reports page from the Quiz reports section of [index.html](index.html).
- Fold learnings from wrong answers into a pandas cheat sheet (`sheets/pandas-cheatsheet.html`, created when the first learnings arrive), ordered by wrangling stage.

## Python rapid fire quiz

- The quiz lives at [quizzes/python-rapid-fire-quiz.html](quizzes/python-rapid-fire-quiz.html) and works like the Pandas Rapid Fire quiz: typed answers, no answer choices. Most questions show a snippet and ask what it prints; the learner types the output (several printed lines separated by spaces) or, if it raises, the exception name. A few ask for one line of Python, graded against accepted forms.
- The question bank lives in [quizzes/python-question-bank.js](quizzes/python-question-bank.js). Its header explains the entry format. Write original questions; don't copy them from other sites.
- The bank covers core Python by concept area (`stage`): types, strings, lists, tuples & sets, dicts, control flow, functions, comprehensions, scope & closures, classes & OOP, iterators & generators, and exceptions. Tag each question with its `stage` and `difficulty`; neither is shown during delivery.
- Keep the same difficulty mix, round sizes (lightning 1/3/1, quick 2/5/3, full 7/15/8), least-used-stage sampling and time limits (20s, 35s, 60s) as the pandas quiz.
- After adding or editing questions, run `python3 tools/check_python_bank.py`. It executes every snippet and fails if the printed output or exception doesn't match `accept[0]`. Avoid output that depends on the Python version, set ordering of non-trivial values, or memory addresses. For one-line code questions, list every reasonable form in `accept` (or `acceptRegex`, written against the normalised answer) and check that an obviously wrong answer is rejected.
- Rounds are recorded automatically through the same save server (`python3 tools/quiz_server.py`, then open http://localhost:8000/quizzes/python-rapid-fire-quiz.html). Finished rounds are POSTed to `/api/python-rounds` and appended to [quizzes/python-rounds.js](quizzes/python-rounds.js); [quizzes/python-quiz-reports.html](quizzes/python-quiz-reports.html) builds a `<section id="python-NNN">` card for each, following the quiz report rules above. Don't hand-write these cards or edit `python-rounds.js` by hand.
- Link the quiz from the Python fundamentals section and its reports page from the Quiz reports section of [index.html](index.html).

## Data Science Framework practice tests

- The timed notebook environment lives at [assessments/ds-framework.html](assessments/ds-framework.html), served by `python3 tools/ds_assessment_server.py` (kernel: `tools/ds_kernel_worker.py`, grader: `tools/ds_grade.py`). See [assessments/README.md](assessments/README.md).
- Each test is a folder in `assessments/tests/<id>/` with `test.json`, `task.html`, `starter.ipynb`, `data/` and `_hidden/` (answers, labels, generator, reference solution). Use original synthetic datasets; don't copy problems from other sites.
- Every task statement names the exact variables or file the grader reads, and states rounding and edge-case rules so there is one correct answer. Regenerate `_hidden/answers.json` with the reference solution whenever the data changes.
- Set each test's model `floor` and `target` from the reference models `solution.py` prints: `floor` near a naive or single-feature baseline, `target` near a solid reference model. Offer 40, 60 and 75 minutes in `duration_options` and mark the standard length in `duration_minutes`.
- Submissions are written to `assessments/submissions/<test-id>/<stamp>/` by the server. Don't edit the generated files by hand. When asked to review one, read `AUTOGRADE.md`, `notebook.ipynb`, `answers.json`, `grade.json` and `meta.json`, judge cleaning, joins, leakage, validation, feature choices and code clarity beyond the auto score, and write the review to `REVIEW.md` in that folder (markdown: a summary table with auto score and time used, then **Strengths**, **Weaknesses** and **Learnings**, with the code fix for each mistake). Its presence unlocks the score on the practice page.
