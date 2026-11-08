# Repository instructions

## Quiz report maintenance

- Keep the quiz reports section in [index.html](index.html) linked to [quiz-reports.html](quiz-reports.html).
- After each quiz, add a new row to the Quiz history table in [quiz-reports.html](quiz-reports.html) and a matching detailed article below it. Preserve all earlier quiz rows and reports.
- Every quiz report must include these sections: **Strengths**, **Weaknesses**, and **Learnings from weaknesses**.
- Make the question-by-question list under **Learnings from weaknesses** collapsible with a clear summary label. For every wrong answer, include the exact question wording, code snippet, and all answer choices as shown in the quiz, plus the learner's answer, correct result, and concept learned.
- Base strengths and weaknesses on the quiz responses. Do not infer mastery from skipped or unanswered questions.
- Record the quiz date, quiz/topic name, total questions, attempted questions, correct, wrong, skipped or unanswered, accuracy among attempted questions, accuracy across all questions, and net score using +1 for correct, 0 for skip, and −1 for wrong.
- Include the quiz duration and per-question time limits when known. If exact elapsed time or a metric is unknown, label it as unknown instead of estimating.
- Check that the history row links to the matching report article, the index still links to the report page, and all report sections are present.

## Python fundamentals quiz design and delivery

- A full Python fundamentals quiz contains 30 questions: 14 medium (about 50%), 7 easy (25%), and 7 hard (25%).
- For a shorter quiz, scale the mix as closely as possible while keeping the same proportions. For a 10-question quiz, use 5 medium, 2 easy, and 3 hard questions.
- Assign a per-question time limit in seconds based on difficulty. Use 20 seconds for easy, 35 seconds for medium, and 60 seconds for hard unless a quiz requires a documented adjustment.
- Show a live countdown timer alongside each question. Start or reset it when the question appears. When time expires, record the question as unanswered and continue.
- Do not show the topic name, difficulty, category label, or any hint alongside a question. Present only the question, code or context needed to answer it, answer choices, and timer.
- Track question difficulty internally for quiz balancing and reporting. Do not use difficulty labels to give away answers during delivery.
- Record the per-question time limits and actual total duration in the report when available; otherwise mark unknown.
