#!/usr/bin/env python3
"""Generate the synthetic Helix Software support-ticket dataset (deterministic).

Writes data/tickets_train.csv, data/tickets_test.csv, data/customers.csv and
_hidden/test_labels.csv, then runs solution.py to write _hidden/answers.json.
"""
import os
import subprocess
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
rng = np.random.default_rng(33)

TEAMS = ["billing", "technical", "account", "shipping"]
TEAM_P = [0.32, 0.33, 0.21, 0.14]
WORDS = {
    "billing": ["invoice", "charged twice", "refund", "payment failed", "card declined", "receipt", "billing cycle",
                "overcharged", "subscription price", "tax", "credit note", "upgrade cost"],
    "technical": ["error", "crash", "not loading", "bug", "sync failed", "api timeout", "export broken", "slow",
                  "integration", "500 error", "login loop", "app freezes"],
    "account": ["password reset", "change email", "delete account", "two-factor", "locked out", "add user",
                "remove user", "permissions", "sso setup", "rename workspace", "username"],
    "shipping": ["delivery", "tracking number", "package", "device not arrived", "return label", "wrong address",
                 "damaged box", "courier", "shipment delayed", "replacement unit"],
}
SHARED = ["urgent", "help", "question about", "issue with", "problem with", "please advise", "follow up", "again"]
CONFUSE = {  # words that legitimately appear in another team's tickets
    "billing": ["account", "upgrade", "workspace"],
    "technical": ["login", "payment page", "device"],
    "account": ["login", "billing contact", "error"],
    "shipping": ["refund", "invoice", "device"],
}

N_CUST = 2400
cust_ids = rng.choice(np.arange(20000, 99999), N_CUST, replace=False)
plans = rng.choice(["free", "pro", "enterprise"], N_CUST, p=[0.45, 0.4, 0.15])
customers = pd.DataFrame({
    "customer_id": cust_ids, "plan": plans,
    "country": rng.choice(["US", "GB", "DE", "FR", "IN", "AU"], N_CUST, p=[0.4, 0.15, 0.12, 0.1, 0.13, 0.1]),
    "signup_date": (pd.Timestamp("2026-03-01") - pd.to_timedelta(rng.integers(10, 1500, N_CUST), unit="D")).strftime("%Y-%m-%d"),
    "has_hardware": (rng.random(N_CUST) < np.where(plans == "enterprise", 0.6, 0.25)).astype(int),
})

N = 9000
rows = []
start = pd.Timestamp("2026-03-01")
for i in range(N):
    c = int(rng.integers(N_CUST))
    plan, hw = plans[c], customers.has_hardware[c]
    p = np.array(TEAM_P, dtype=float)
    if hw:
        p[3] *= 2.4
    else:
        p[3] *= 0.25
    if plan == "free":
        p[0] *= 0.5; p[2] *= 2.2; p[1] *= 0.8
    if plan == "enterprise":
        p[2] *= 1.3; p[0] *= 1.6
    p /= p.sum()
    team = rng.choice(TEAMS, p=p)
    # subject: mixture of team words, shared words and confusers
    parts = []
    u = rng.random()
    if u < 0.30:
        parts = [rng.choice(SHARED), rng.choice(CONFUSE[team])]
    else:
        parts = [rng.choice(WORDS[team])]
        if rng.random() < 0.5:
            parts.insert(0, rng.choice(SHARED))
        if rng.random() < 0.3:
            parts.append(rng.choice(CONFUSE[team]))
        if rng.random() < 0.22:  # mislabelled-looking: another team's keyword
            parts.append(rng.choice(WORDS[rng.choice([t for t in TEAMS if t != team])]))
    subject = " ".join(parts)
    r = rng.random()
    subject = subject.upper() if r < 0.07 else (subject.capitalize() if r < 0.5 else subject)
    if rng.random() < 0.02:
        subject = rng.choice([np.nan, "", "   "])
    channel = rng.choice(["email", "chat", "phone"], p={"billing": [0.6, 0.25, 0.15], "technical": [0.4, 0.45, 0.15],
                                                        "account": [0.45, 0.4, 0.15], "shipping": [0.5, 0.2, 0.3]}[team])
    prio = rng.choice(["high", "medium", "low"], p={"technical": [0.4, 0.4, 0.2]}.get(team, [0.2, 0.5, 0.3]))
    if plan == "enterprise" and rng.random() < 0.3:
        prio = "high"
    prio_txt = {"high": ["High", "high", "P1", "HIGH", "p1"], "medium": ["Medium", "medium", "P2", "med"],
                "low": ["Low", "low", "P3"]}[prio]
    prio_txt = rng.choice(prio_txt)
    attach = int(rng.poisson({"technical": 1.4, "shipping": 0.9, "billing": 0.5, "account": 0.2}[team]))
    created = start + pd.Timedelta(minutes=float(rng.uniform(0, 75 * 24 * 60)))
    resp_h = rng.gamma(2, {"billing": 3, "technical": 6, "account": 2, "shipping": 8}[team]) * (0.5 if prio == "high" else 1)
    first = created + pd.Timedelta(hours=float(resp_h)) if rng.random() > 0.06 else pd.NaT
    rows.append((cust_ids[c], created, first, channel, prio_txt, subject, attach, team))

df = pd.DataFrame(rows, columns=["customer_id", "created_at", "first_response_at", "channel", "priority", "subject",
                                 "n_attachments", "team"])
df = df.sort_values("created_at").reset_index(drop=True)
df["ticket_id"] = ["TK%06d" % i for i in rng.choice(np.arange(100000, 999999), len(df), replace=False)]
df["created_at"] = df["created_at"].dt.strftime("%Y-%m-%d %H:%M")
df["first_response_at"] = df["first_response_at"].dt.strftime("%Y-%m-%d %H:%M")
cols = ["ticket_id", "customer_id", "created_at", "first_response_at", "channel", "priority", "subject", "n_attachments"]
test_mask = rng.random(len(df)) < 0.25
train, test = df[~test_mask], df[test_mask]
# the test set has no blank subjects, so every test row can be scored
test = test[test["subject"].fillna("").str.strip() != ""]
os.makedirs(DATA, exist_ok=True)
train[cols + ["team"]].to_csv(os.path.join(DATA, "tickets_train.csv"), index=False)
test[cols].to_csv(os.path.join(DATA, "tickets_test.csv"), index=False)
customers.to_csv(os.path.join(DATA, "customers.csv"), index=False)
test[["ticket_id", "team"]].to_csv(os.path.join(HERE, "test_labels.csv"), index=False)
print("train", train.shape, "test", test.shape, train.team.value_counts(normalize=True).round(3).to_dict())
subprocess.run([sys.executable, os.path.join(HERE, "solution.py")], check=True)
