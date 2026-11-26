#!/usr/bin/env python3
"""Generate the synthetic Fresh Crate churn dataset (deterministic, seed 7).

Writes data/train.csv, data/test.csv, data/orders.csv and _hidden/test_labels.csv,
then runs solution.py to write _hidden/answers.json.

    python3 assessments/tests/fresh-crate-churn/_hidden/make_data.py
"""
import os
import subprocess
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.dirname(HERE)
DATA = os.path.join(TEST_DIR, "data")
SNAPSHOT = pd.Timestamp("2026-06-30")
rng = np.random.default_rng(7)

N_TRAIN, N_TEST, N_DUP = 3200, 1000, 57
n = N_TRAIN + N_TEST

ids = rng.choice(np.arange(100000, 999999), size=n, replace=False)
plan = rng.choice(["Basic", "Standard", "Premium"], size=n, p=[0.45, 0.35, 0.20])
region = rng.choice(["North", "South", "East", "West"], size=n, p=[0.3, 0.25, 0.25, 0.2])
payment = rng.choice(["card", "paypal", "bank_transfer"], size=n, p=[0.6, 0.25, 0.15])
signup = SNAPSHOT - pd.to_timedelta(rng.integers(30, 900, size=n), unit="D")
age = np.clip(rng.normal(38, 11, size=n).round(), 18, 80)
referred = rng.random(n) < 0.28
discount = rng.choice([0, 0, 0, 5, 10, 15, 20], size=n)
base_fee = pd.Series(plan).map({"Basic": 19.99, "Standard": 29.99, "Premium": 44.99}).to_numpy()
region_mult = pd.Series(region).map({"North": 1.0, "South": 0.95, "East": 1.05, "West": 1.10}).to_numpy()
fee = np.round(base_fee * region_mult, 2)
rating = np.clip(rng.normal(3.8, 0.8, size=n), 1, 5).round(1)

tenure = (SNAPSHOT - signup).days.to_numpy()
# order behaviour
late_prop = np.clip(rng.beta(2, 9, size=n) + (region == "West") * 0.06, 0, 1)
order_rate = rng.gamma(3, 1.0, size=n) * (1 + (plan == "Premium") * 0.4)  # orders / month
n_orders = rng.poisson(order_rate * np.minimum(tenure, 365) / 30.0 * 0.22)
n_orders[rng.random(n) < 0.06] = 0

# churn logit
z = (-1.0
     + 2.8 * (late_prop - 0.2) * 3
     - 0.9 * np.log1p(n_orders) + 1.6
     - 0.8 * (rating - 3.8)
     + 0.55 * (plan == "Basic") - 0.45 * (plan == "Premium")
     - 0.6 * referred
     - 0.035 * discount
     - 0.0012 * (tenure - 400)
     + 1.2 * (n_orders == 0)
     + 0.35 * (payment == "bank_transfer"))
p = 1 / (1 + np.exp(-1.7 * z - 0.9))
churned = (rng.random(n) < p).astype(int)

# ---- orders table
rows = []
oid = 5000000
for i in range(n):
    k = int(n_orders[i])
    if k == 0:
        # some never-completed customers still have cancelled orders
        if rng.random() < 0.4:
            k_c = int(rng.integers(1, 3))
            for _ in range(k_c):
                oid += 1
                d = signup[i] + pd.Timedelta(days=int(rng.integers(0, max(tenure[i], 1))))
                rows.append((oid, ids[i], d.date().isoformat(), round(float(rng.uniform(20, 90)), 2), 0, "cancelled"))
        continue
    days = np.sort(rng.integers(0, max(tenure[i], 1), size=k))
    for d_ in days:
        oid += 1
        status = rng.choice(["completed", "cancelled", "refunded"], p=[0.86, 0.09, 0.05])
        amount = round(float(fee[i] * rng.uniform(1.1, 2.6)), 2)
        late = int(rng.random() < late_prop[i]) if status != "cancelled" else 0
        rows.append((oid, ids[i], (signup[i] + pd.Timedelta(days=int(d_))).date().isoformat(), amount, late, status))
# orphan orders (customer ids not in either table)
for _ in range(40):
    oid += 1
    rows.append((oid, int(rng.integers(1000, 9999)), "2026-01-15", round(float(rng.uniform(20, 90)), 2), 0, "completed"))
orders = pd.DataFrame(rows, columns=["order_id", "customer_id", "order_date", "amount", "delivered_late", "status"])
orders = orders.sample(frac=1, random_state=3).reset_index(drop=True)

# ---- messy customer table
plan_variants = {"Basic": ["Basic", "basic", " Basic", "BASIC", "basic "],
                 "Standard": ["Standard", "standard", "Standard ", "STANDARD"],
                 "Premium": ["Premium", "premium", " PREMIUM", "Premium "]}
plan_messy = [plan_variants[x][rng.choice(len(plan_variants[x]), p=None)] if rng.random() < 0.35 else x for x in plan]
fee_str = [f"${f:.2f}" if rng.random() < 0.7 else f"{f:.2f}" for f in fee]
ref_str = []
for r in referred:
    u = rng.random()
    if u < 0.04:
        ref_str.append(np.nan)
    elif r:
        ref_str.append(rng.choice(["Yes", "Y", "yes"], p=[0.7, 0.2, 0.1]))
    else:
        ref_str.append(rng.choice(["No", "N", "no"], p=[0.7, 0.2, 0.1]))
age_out = age.astype(float)
age_out[rng.random(n) < 0.05] = np.nan
rating_out = rating.astype(float)
rating_out[rng.random(n) < 0.12] = np.nan

cust = pd.DataFrame({
    "customer_id": ids,
    "signup_date": signup.strftime("%Y-%m-%d"),
    "plan": plan_messy,
    "region": region,
    "age": age_out,
    "monthly_fee": fee_str,
    "discount_pct": discount,
    "payment_method": payment,
    "referred": ref_str,
    "avg_rating": rating_out,
    "churned": churned,
})
train = cust.iloc[:N_TRAIN].copy()
test = cust.iloc[N_TRAIN:].copy()
dups = train.sample(N_DUP, random_state=11)
train = pd.concat([train, dups]).sample(frac=1, random_state=5).reset_index(drop=True)

os.makedirs(DATA, exist_ok=True)
train.to_csv(os.path.join(DATA, "train.csv"), index=False)
test.drop(columns="churned").to_csv(os.path.join(DATA, "test.csv"), index=False)
orders.to_csv(os.path.join(DATA, "orders.csv"), index=False)
test[["customer_id", "churned"]].to_csv(os.path.join(HERE, "test_labels.csv"), index=False)
print("train", train.shape, "test", test.shape, "orders", orders.shape, "churn rate %.3f" % train.churned.mean())

subprocess.run([sys.executable, os.path.join(HERE, "solution.py")], check=True)
