#!/usr/bin/env python3
"""Reference solution for Helix ticket routing: writes _hidden/answers.json, prints reference macro F1."""
import json
import os

import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
PRIO = {"high": "high", "p1": "high", "medium": "medium", "med": "medium", "p2": "medium", "low": "low", "p3": "low"}

customers = pd.read_csv(os.path.join(DATA, "customers.csv"))


def clean(df, drop_blank=True):
    df = df.copy()
    if drop_blank:
        df = df[df["subject"].fillna("").str.strip() != ""]
    df["subject"] = df["subject"].fillna("").str.strip().str.lower()
    df["priority"] = df["priority"].str.strip().str.lower().map(PRIO)
    df["created_at"] = pd.to_datetime(df["created_at"])
    df["first_response_at"] = pd.to_datetime(df["first_response_at"])
    df["response_hours"] = (df["first_response_at"] - df["created_at"]).dt.total_seconds() / 3600
    return df.merge(customers, on="customer_id", how="left")


train = clean(pd.read_csv(os.path.join(DATA, "tickets_train.csv")))
test = clean(pd.read_csv(os.path.join(DATA, "tickets_test.csv")), drop_blank=False)

ent = train[train["plan"] == "enterprise"]
answers = {
    "task1_n_rows": int(len(train)),
    "task1_priority_counts": {k: int(v) for k, v in train["priority"].value_counts().items()},
    "task1_team_share": {k: round(float(v), 3) for k, v in train["team"].value_counts(normalize=True).items()},
    "task2_median_response_hours_by_team": {k: round(float(v), 2) for k, v in train.groupby("team")["response_hours"].median().items()},
    "task2_pct_unanswered": round(float(train["first_response_at"].isna().mean()), 4),
    "task3_top_team_by_plan": {k: str(v) for k, v in train.groupby("plan")["team"].agg(lambda s: s.value_counts().idxmax()).items()},
    "task3_enterprise_high_share": round(float((ent["priority"] == "high").mean()), 4),
}
json.dump(answers, open(os.path.join(HERE, "answers.json"), "w"), indent=1)
print(json.dumps(answers, indent=1))

labels = pd.read_csv(os.path.join(HERE, "test_labels.csv"))
yte = test[["ticket_id"]].merge(labels, on="ticket_id")["team"]
y = train["team"]


def meta(df):
    return pd.get_dummies(df[["channel", "priority", "plan"]], dtype=float).assign(
        att=df["n_attachments"], hw=df["has_hardware"])


Mtr, Mte = meta(train), meta(test)
Mte = Mte.reindex(columns=Mtr.columns, fill_value=0)
rf = RandomForestClassifier(300, random_state=0, n_jobs=-1).fit(Mtr, y)
print("metadata-only RF macro F1 %.4f" % f1_score(yte, rf.predict(Mte), average="macro"))
print("majority class macro F1 %.4f" % f1_score(yte, [y.value_counts().idxmax()] * len(yte), average="macro"))
tf = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
Ttr, Tte = tf.fit_transform(train["subject"]), tf.transform(test["subject"])
lr = LogisticRegression(max_iter=3000, C=4).fit(Ttr, y)
print("tfidf-only logreg macro F1 %.4f" % f1_score(yte, lr.predict(Tte), average="macro"))
sc = Mtr.max().replace(0, 1)
Xtr, Xte = hstack([Ttr, csr_matrix((Mtr / sc).values)]), hstack([Tte, csr_matrix((Mte / sc).values)])
lr2 = LogisticRegression(max_iter=3000, C=4).fit(Xtr, y)
print("tfidf+meta logreg macro F1 %.4f" % f1_score(yte, lr2.predict(Xte), average="macro"))
