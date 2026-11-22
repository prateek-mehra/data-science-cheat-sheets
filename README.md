# Data Science Cheat Sheets

![Sheets](https://img.shields.io/badge/cheat%20sheets-12-0b67b2)
![HTML](https://img.shields.io/badge/built%20with-plain%20HTML%20%2B%20CSS-e34f26?logo=html5&logoColor=white)
![No build](https://img.shields.io/badge/build%20step-none-2ea44f)
![Printable](https://img.shields.io/badge/printable-yes-6f42c1)

Small, printable HTML pages covering the fundamentals of data science and ML interviews.
Open [`index.html`](index.html) in a browser to browse everything, or jump straight to a sheet below.

<p align="center"><img src="assets/previews/index.jpg" alt="Cheat sheet index" width="720"></p>

## Map of the sheets

The sheets are grouped by interview stage, the same way the index page groups them.

```mermaid
mindmap
  root((Cheat sheets))
    Python
      Python fundamentals
      Python DSA
      NumPy
      ML pipeline: EDA to model
    SQL
      SQL overview
    ML fundamentals
      Probability
      ML optimizers
      ML losses
    Deep learning
      PyTorch
      YOLO architecture
        YOLO evolution timeline
    System design
      System design round
    Practice
      Quiz reports
```

## Sheets

| Stage | Sheet | What it covers |
| --- | --- | --- |
| 🐍 Python | [Python fundamentals](sheets/python-fundamentals.html) | Python fundamentals overview |
| 🧩 Coding round | [Python DSA](sheets/python-dsa-data-structures-cheatsheet.html) | Quick syntax, common moves and interview traps |
| 🧩 Coding round | [NumPy](sheets/numpy-basics-cheatsheet.html) | Creating, reshaping, indexing, math and combining arrays |
| 🧩 Coding round | [ML pipeline](sheets/ml-pipeline-cheatsheet.html) | Timed EDA → preprocess → model round: lines to remember |
| 🗄️ SQL | [SQL](sheets/sql-cheatsheet.html) | `CASE WHEN`, joins, grouping, clause order, CTEs, window functions |
| 📐 ML fundamentals | [Probability](sheets/probability-cheatsheet.html) | Conditional probability, Bayes theorem, random variables |
| 📐 ML fundamentals | [ML optimizers](sheets/ml-optimizers-cheatsheet.html) | Core formulas, what each optimizer adds, and when it appeared |
| 📐 ML fundamentals | [ML losses](sheets/ml-losses-cheatsheet.html) | Picking a loss for the task, target structure and errors you care about |
| 🧠 Deep learning | [PyTorch](sheets/pytorch-cheatsheet.html) | Update rule, batch vs mini-batch, training loop, a small CNN |
| 🧠 Deep learning | [YOLO architecture](sheets/yolo-architecture-cheatsheet.html) | Major architectural shifts from YOLOv1 to YOLO26 |
| 🧠 Deep learning | [YOLO evolution](sheets/yolo-architecture-evolution.html) | Interactive YOLO architecture timeline |
| 🏗️ System design | [System design](sheets/system-design-cheatsheet.html) | Requirements, scaling, storage, reliability and trade-offs |
| 📝 Practice | [Quiz reports](quizzes/quiz-reports.html) | Python MCQ quiz history with strengths and weaknesses |

## Previews

<table>
  <tr>
    <td align="center"><a href="sheets/yolo-architecture-evolution.html"><img src="assets/previews/yolo-architecture-evolution.jpg" width="360" alt="YOLO evolution"></a><br><sub>YOLO evolution</sub></td>
    <td align="center"><a href="sheets/ml-pipeline-cheatsheet.html"><img src="assets/previews/ml-pipeline-cheatsheet.jpg" width="360" alt="ML pipeline"></a><br><sub>ML pipeline</sub></td>
  </tr>
  <tr>
    <td align="center"><a href="sheets/ml-optimizers-cheatsheet.html"><img src="assets/previews/ml-optimizers-cheatsheet.jpg" width="360" alt="ML optimizers"></a><br><sub>ML optimizers</sub></td>
    <td align="center"><a href="sheets/pytorch-cheatsheet.html"><img src="assets/previews/pytorch-cheatsheet.jpg" width="360" alt="PyTorch"></a><br><sub>PyTorch</sub></td>
  </tr>
</table>

<details>
<summary>More previews</summary>

| | |
| --- | --- |
| <img src="assets/previews/python-fundamentals.jpg" width="360" alt="Python fundamentals"><br><sub>Python fundamentals</sub> | <img src="assets/previews/python-dsa-data-structures-cheatsheet.jpg" width="360" alt="Python DSA"><br><sub>Python DSA</sub> |
| <img src="assets/previews/numpy-basics-cheatsheet.jpg" width="360" alt="NumPy"><br><sub>NumPy</sub> | <img src="assets/previews/sql-cheatsheet.jpg" width="360" alt="SQL"><br><sub>SQL</sub> |
| <img src="assets/previews/probability-cheatsheet.jpg" width="360" alt="Probability"><br><sub>Probability</sub> | <img src="assets/previews/ml-losses-cheatsheet.jpg" width="360" alt="ML losses"><br><sub>ML losses</sub> |
| <img src="assets/previews/yolo-architecture-cheatsheet.jpg" width="360" alt="YOLO architecture"><br><sub>YOLO architecture</sub> | <img src="assets/previews/system-design-cheatsheet.jpg" width="360" alt="System design"><br><sub>System design</sub> |
| <img src="assets/previews/quiz-reports.jpg" width="360" alt="Quiz reports"><br><sub>Quiz reports</sub> | |

</details>

## Repository layout

```text
.
├── index.html          # entry point: grouped index of every sheet
├── sheets/             # one self-contained HTML page per topic
├── quizzes/            # quiz history and per-quiz reports
├── assets/
│   ├── images/         # figures embedded in the sheets
│   └── previews/       # screenshots used in this README
├── AGENTS.md           # maintenance rules for quizzes and reports
└── README.md
```

## Adding a sheet

1. Create `sheets/<topic>-cheatsheet.html`. Link back with `href="../index.html"` and put images in `assets/images/` (referenced as `../assets/images/...`).
2. Add it to the right stage in [`index.html`](index.html) as `sheets/<topic>-cheatsheet.html`.
3. Add a row to the table above and a node to the map.
