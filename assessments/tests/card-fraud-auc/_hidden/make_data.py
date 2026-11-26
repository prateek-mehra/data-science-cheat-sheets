#!/usr/bin/env python3
"""Generate the synthetic Northwind Pay card-fraud dataset (deterministic).

Writes data/transactions_train.csv, data/transactions_test.csv, data/cards.csv and
_hidden/test_labels.csv, then runs solution.py to write _hidden/answers.json.
"""
import os
import subprocess
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
rng = np.random.default_rng(21)

# ---- cards
N_CARDS = 2500
card_ids = ["C%05d" % i for i in rng.choice(np.arange(10000, 99999), N_CARDS, replace=False)]
card_country = rng.choice(["US", "GB", "DE", "IN", "BR"], N_CARDS, p=[0.62, 0.12, 0.1, 0.1, 0.06])
card_type = rng.choice(["credit", "debit", "prepaid"], N_CARDS, p=[0.5, 0.42, 0.08])
issue = pd.Timestamp("2026-05-31") - pd.to_timedelta(rng.integers(5, 2000, N_CARDS), unit="D")
limit = np.where(card_type == "credit", rng.choice([1000, 2500, 5000, 10000, 20000], N_CARDS), np.nan)
cards = pd.DataFrame({"card_id": card_ids, "card_type": card_type, "card_country": card_country,
                      "issue_date": issue.strftime("%Y-%m-%d"), "credit_limit": limit})
compromised = rng.random(N_CARDS) < 0.035

CATS = ["grocery", "restaurants", "fuel", "electronics", "travel", "gift_cards", "apparel", "online_services"]
CAT_P = [0.24, 0.18, 0.12, 0.08, 0.07, 0.04, 0.15, 0.12]
CAT_RISK = {"grocery": -0.9, "restaurants": -0.6, "fuel": -0.3, "electronics": 1.0, "travel": 0.5,
            "gift_cards": 1.7, "apparel": 0.1, "online_services": 0.3}
START, END = pd.Timestamp("2026-01-01"), pd.Timestamp("2026-06-01")
SPAN = (END - START).total_seconds()

rows = []


def add_tx(ci, ts, burst=False):
    online = rng.random() < (0.85 if burst else 0.38)
    cat = rng.choice(CATS, p=CAT_P) if not burst else rng.choice(["electronics", "gift_cards", "online_services", "travel"])
    home = card_country[ci]
    foreign = rng.random() < (0.55 if burst else 0.06)
    country = rng.choice([c for c in ["US", "GB", "DE", "IN", "BR", "NG", "RU", "CN"] if c != home]) if foreign else home
    amt = float(np.round(rng.lognormal(3.4 if not burst else 4.6, 0.9), 2))
    hour = ts.hour
    card_age = (ts - issue[ci]).days
    z = (-6.4 + 1.3 * online + 1.4 * foreign + 0.9 * (hour < 6) + 0.45 * np.log1p(amt) - 1.2
         + CAT_RISK[cat] + 0.8 * (card_type[ci] == "prepaid") + 0.7 * (card_age < 90))
    if burst:
        z += 4.4
    fraud = int(rng.random() < 1 / (1 + np.exp(-z)))
    rows.append((ci, ts, amt, cat, country, "online" if online else "pos", fraud))


for ci in range(N_CARDS):
    k = rng.poisson(14)
    for t in np.sort(rng.random(k)):
        add_tx(ci, START + pd.Timedelta(seconds=float(t * SPAN)))
    if compromised[ci]:
        t0 = START + pd.Timedelta(seconds=float(rng.random() * (SPAN - 86400)))
        for j in range(int(rng.integers(3, 9))):
            add_tx(ci, t0 + pd.Timedelta(minutes=float(rng.uniform(0, 600))), burst=True)

tx = pd.DataFrame(rows, columns=["ci", "timestamp", "amount", "merchant_category", "country", "channel", "is_fraud"])
tx = tx.sort_values("timestamp").reset_index(drop=True)
tx["tx_id"] = ["T%07d" % i for i in rng.choice(np.arange(1_000_000, 9_999_999), len(tx), replace=False)]
tx["card_id"] = [card_ids[i] for i in tx["ci"]]

# messiness
def messy_cat(c):
    u = rng.random()
    return c.upper() if u < 0.08 else (" " + c if u < 0.14 else (c.replace("_", " ").title().replace(" ", "_") if u < 0.22 else c))
tx["merchant_category"] = [messy_cat(c) for c in tx["merchant_category"]]
tx["amount"] = ["{:,.2f}".format(a) if (a >= 1000 and rng.random() < 0.8) else "%.2f" % a for a in tx["amount"]]
tx.loc[rng.random(len(tx)) < 0.03, "country"] = np.nan
tx["timestamp"] = tx["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

cols = ["tx_id", "card_id", "timestamp", "amount", "merchant_category", "country", "channel"]
is_test = tx["timestamp"] >= "2026-05-01"
train, test = tx[~is_test], tx[is_test]
os.makedirs(DATA, exist_ok=True)
train[cols + ["is_fraud"]].to_csv(os.path.join(DATA, "transactions_train.csv"), index=False)
test[cols].to_csv(os.path.join(DATA, "transactions_test.csv"), index=False)
cards.to_csv(os.path.join(DATA, "cards.csv"), index=False)
test[["tx_id", "is_fraud"]].to_csv(os.path.join(HERE, "test_labels.csv"), index=False)
print("train", train.shape, "fraud %.4f" % train.is_fraud.mean(), "test", test.shape, "fraud %.4f" % test.is_fraud.mean())
subprocess.run([sys.executable, os.path.join(HERE, "solution.py")], check=True)
