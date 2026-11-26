#!/usr/bin/env python3
"""Reference solution for Northwind Pay card fraud: writes _hidden/answers.json, prints reference AUCs."""
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")

cards = pd.read_csv(os.path.join(DATA, "cards.csv"))


def clean(df):
    df = df.copy()
    df["amount"] = df["amount"].astype(str).str.replace(",", "", regex=False).astype(float)
    df["merchant_category"] = df["merchant_category"].str.strip().str.lower()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.merge(cards, on="card_id", how="left")
    df["foreign"] = (df["country"].notna() & (df["country"] != df["card_country"])).astype(int)
    return df


train = clean(pd.read_csv(os.path.join(DATA, "transactions_train.csv")))
test = clean(pd.read_csv(os.path.join(DATA, "transactions_test.csv")))

counts = train["merchant_category"].value_counts()
rate = train.groupby("merchant_category")["is_fraud"].mean()
answers = {
    "task1_fraud_rate": round(float(train["is_fraud"].mean()), 4),
    "task1_n_cards": int(train["card_id"].nunique()),
    "task1_max_amount": round(float(train["amount"].max()), 2),
    "task2_fraud_rate_by_channel": {k: round(float(v), 4) for k, v in train.groupby("channel")["is_fraud"].mean().items()},
    "task2_top_category": str(rate[counts[counts >= 500].index].idxmax()),
    "task2_foreign_fraud_rate": round(float(train.loc[train["foreign"] == 1, "is_fraud"].mean()), 4),
}
json.dump(answers, open(os.path.join(HERE, "answers.json"), "w"), indent=1)
print(json.dumps(answers, indent=1))


def feats(df):
    df = df.sort_values("timestamp")
    df["day"] = df["timestamp"].dt.floor("D")
    X = pd.DataFrame(index=df.index)
    X["log_amount"] = np.log1p(df["amount"])
    X["hour"] = df["timestamp"].dt.hour
    X["night"] = (X["hour"] < 6).astype(int)
    X["online"] = (df["channel"] == "online").astype(int)
    X["foreign"] = df["foreign"]
    X["country_missing"] = df["country"].isna().astype(int)
    X["card_age"] = (df["timestamp"] - pd.to_datetime(df["issue_date"])).dt.days
    X["tx_same_day"] = df.groupby(["card_id", "day"])["tx_id"].transform("count")
    X["amt_vs_card_median"] = df["amount"] / df.groupby("card_id")["amount"].transform("median")
    X = X.join(pd.get_dummies(df[["merchant_category", "card_type"]], dtype=int))
    return X.sort_index()


Xtr, Xte = feats(train), feats(test)
Xte = Xte.reindex(columns=Xtr.columns, fill_value=0)
y = train["is_fraud"]
labels = pd.read_csv(os.path.join(HERE, "test_labels.csv"))
yte = test[["tx_id"]].merge(labels, on="tx_id")["is_fraud"]
base = ["log_amount"]
lr0 = LogisticRegression(max_iter=1000).fit(Xtr[base], y)
print("amount-only AUC %.4f" % roc_auc_score(yte, lr0.predict_proba(Xte[base])[:, 1]))
raw = ["log_amount", "hour", "online", "foreign"]
lr1 = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(Xtr[raw], y)
print("simple logreg AUC %.4f" % roc_auc_score(yte, lr1.predict_proba(Xte[raw])[:, 1]))
lr = make_pipeline(StandardScaler(), LogisticRegression(max_iter=3000, class_weight="balanced")).fit(Xtr, y)
print("full logreg AUC %.4f" % roc_auc_score(yte, lr.predict_proba(Xte)[:, 1]))
gb = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, random_state=0).fit(Xtr, y)
print("HGB AUC %.4f" % roc_auc_score(yte, gb.predict_proba(Xte)[:, 1]))
