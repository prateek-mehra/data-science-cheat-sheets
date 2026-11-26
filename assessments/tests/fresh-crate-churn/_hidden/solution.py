#!/usr/bin/env python3
"""Reference solution for Fresh Crate churn. Writes _hidden/answers.json and prints
the reference model's F1 on the hidden labels (used to set the pass bar)."""
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
SNAPSHOT = pd.Timestamp("2026-06-30")


def clean(df):
    df = df.copy()
    df["plan"] = df["plan"].str.strip().str.title()
    df["monthly_fee"] = df["monthly_fee"].astype(str).str.replace("$", "", regex=False).astype(float)
    df["referred"] = df["referred"].str.strip().str.lower().map({"yes": 1, "y": 1, "no": 0, "n": 0})
    df["signup_date"] = pd.to_datetime(df["signup_date"])
    df["tenure_days"] = (SNAPSHOT - df["signup_date"]).dt.days
    return df


train = pd.read_csv(os.path.join(DATA, "train.csv")).drop_duplicates()
test = pd.read_csv(os.path.join(DATA, "test.csv"))
orders = pd.read_csv(os.path.join(DATA, "orders.csv"))
train, test = clean(train), clean(test)

# Task 1
t1_rows = len(train)
t1_plan_counts = {k: int(v) for k, v in train["plan"].value_counts().items()}
t1_mean_fee = round(float(train["monthly_fee"].mean()), 2)

# Task 2
comp = orders[orders["status"] == "completed"]
agg = comp.groupby("customer_id").agg(n_orders=("order_id", "count"),
                                      total_spend=("amount", "sum"),
                                      late_rate=("delivered_late", "mean")).reset_index()


def add_feats(df):
    df = df.merge(agg, on="customer_id", how="left")
    df["n_orders"] = df["n_orders"].fillna(0)
    df["total_spend"] = df["total_spend"].fillna(0.0)
    return df


train, test = add_feats(train), add_feats(test)
t2_no_orders = int((train["n_orders"] == 0).sum())
t2_top = int(train.loc[train["total_spend"].idxmax(), "customer_id"])
t2_late_by_region = {k: round(float(v), 3) for k, v in train.groupby("region")["late_rate"].mean().items()}

# Task 3
t3_churn_by_plan = {k: round(float(v), 3) for k, v in train.groupby("plan")["churned"].mean().items()}
t3_churn_no_orders = round(float(train.loc[train["n_orders"] == 0, "churned"].mean()), 3)

answers = {
    "task1_n_rows": t1_rows,
    "task1_plan_counts": t1_plan_counts,
    "task1_mean_fee": t1_mean_fee,
    "task2_no_orders": t2_no_orders,
    "task2_top_customer": t2_top,
    "task2_late_rate_by_region": t2_late_by_region,
    "task3_churn_by_plan": t3_churn_by_plan,
    "task3_churn_rate_no_orders": t3_churn_no_orders,
}
with open(os.path.join(HERE, "answers.json"), "w") as f:
    json.dump(answers, f, indent=1)
print(json.dumps(answers, indent=1))

# Task 4 reference models
def feats(df):
    X = pd.DataFrame({
        "tenure_days": df["tenure_days"], "monthly_fee": df["monthly_fee"], "discount_pct": df["discount_pct"],
        "age": df["age"].fillna(train["age"].median()), "avg_rating": df["avg_rating"].fillna(train["avg_rating"].median()),
        "rating_missing": df["avg_rating"].isna().astype(int),
        "referred": df["referred"].fillna(0), "n_orders": df["n_orders"], "log_orders": np.log1p(df["n_orders"]),
        "total_spend": df["total_spend"], "late_rate": df["late_rate"].fillna(train["late_rate"].mean()),
        "no_orders": (df["n_orders"] == 0).astype(int),
    })
    return X.join(pd.get_dummies(df[["plan", "region", "payment_method"]], dtype=int))


Xtr, Xte = feats(train), feats(test)
Xte = Xte.reindex(columns=Xtr.columns, fill_value=0)
y = train["churned"]
labels = pd.read_csv(os.path.join(HERE, "test_labels.csv"))
yte = test[["customer_id"]].merge(labels, on="customer_id")["churned"]
for name, m in [("logreg", make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, class_weight="balanced"))),
                ("rf", RandomForestClassifier(400, min_samples_leaf=5, class_weight="balanced", random_state=0, n_jobs=-1))]:
    cv = cross_val_score(m, Xtr, y, cv=5, scoring="f1").mean()
    m.fit(Xtr, y)
    print(name, "cv F1 %.3f" % cv, "test F1 %.3f" % f1_score(yte, m.predict(Xte)))
# naive baseline: everyone churns
print("all-ones F1 %.3f" % f1_score(yte, np.ones(len(yte))))
