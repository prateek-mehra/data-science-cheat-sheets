// Pandas Rapid Fire rounds, written by tools/quiz_server.py when a round ends.
// quizzes/pandas-quiz-reports.html builds a report card for each entry. Do not edit by hand.
window.PANDAS_ROUNDS = [
 {
  "uid": "1795641415487-3anyas",
  "date": "2026-11-25T21:16:55.487Z",
  "round": "Lightning 5",
  "score": 3,
  "duration": 66,
  "limits": {
   "easy": 20,
   "medium": 35,
   "hard": 60
  },
  "items": [
   {
    "id": "str-clean",
    "stage": "clean",
    "difficulty": "medium",
    "question": "Clean 'city': strip surrounding spaces and make it lowercase (overwrite the column).",
    "ctx": "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']",
    "typed": "df['city'] = df['city'].str.strip().str.lower()",
    "status": "correct",
    "kind": "submit",
    "answer": "df['city'] = df['city'].str.strip().str.lower()",
    "learn": "The .str accessor vectorises string methods, and every call needs its own .str: df['c'].str.strip().str.lower().",
    "secs": 21,
    "limit": 35
   },
   {
    "id": "nulls",
    "stage": "inspect",
    "difficulty": "medium",
    "question": "Count the missing values in every column.",
    "ctx": "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']",
    "typed": "df.isna().sum()",
    "status": "correct",
    "kind": "submit",
    "answer": "df.isna().sum()",
    "learn": "isna() returns a boolean frame; .sum() counts True per column. isnull() is an alias; .mean() gives the share missing.",
    "secs": 9,
    "limit": 35
   },
   {
    "id": "head",
    "stage": "inspect",
    "difficulty": "easy",
    "question": "Show the first 5 rows of df.",
    "ctx": "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']",
    "typed": "df.head(5)",
    "status": "correct",
    "kind": "submit",
    "answer": "df.head()",
    "learn": "df.head() defaults to n=5; df.tail() shows the last rows; df.sample(5) random rows.",
    "secs": 7,
    "limit": 20
   },
   {
    "id": "rank-within",
    "stage": "aggregate",
    "difficulty": "hard",
    "question": "Add a column 'rank' ranking salary within each dept, highest salary = 1.",
    "ctx": "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']",
    "typed": "",
    "status": "skip",
    "kind": "skip",
    "answer": "df['rank'] = df.groupby('dept')['salary'].rank(ascending=False)",
    "learn": "groupby().rank() keeps the original index, so it assigns straight back as a column, like SQL RANK() OVER (PARTITION BY dept ORDER BY salary DESC). method='dense' avoids gaps on ties.",
    "secs": 14,
    "limit": 60
   },
   {
    "id": "isin",
    "stage": "select",
    "difficulty": "medium",
    "question": "Keep rows where city is 'Delhi' or 'Mumbai', using a single membership test.",
    "ctx": "df.columns → ['name', 'dept', 'salary', 'age', 'city', 'join_date']",
    "typed": "",
    "status": "skip",
    "kind": "skip",
    "answer": "df[df['city'].isin(['Delhi', 'Mumbai'])]",
    "learn": "Series.isin(list) is pandas' SQL IN (...): cleaner than chaining == with |. Negate with ~df['city'].isin(...).",
    "secs": 10,
    "limit": 35
   }
  ]
 }
];
