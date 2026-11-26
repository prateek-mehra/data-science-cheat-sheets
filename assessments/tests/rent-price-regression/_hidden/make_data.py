#!/usr/bin/env python3
"""Generate the synthetic Harbor Homes rental-listings dataset (deterministic).

Writes data/listings_train.csv, data/listings_test.csv, data/neighbourhoods.csv and
_hidden/test_labels.csv, then runs solution.py to write _hidden/answers.json.
"""
import os
import subprocess
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
rng = np.random.default_rng(44)

BOROUGHS = {"Harbourside": ["Pier Row", "Old Docks", "Lighthouse", "Saltmarsh", "Anchor Bay", "Quayside"],
            "Northgate": ["Elm Park", "Mill Hill", "Kingsfield", "Northcross", "Fernwood", "Brookvale"],
            "Eastbank": ["Riverside", "Foundry", "Canal Quarter", "Brickworks", "Ashton", "Marlow"],
            "Westmoor": ["Heathside", "Stonebridge", "Westlea", "Oakhurst", "Briar Hill", "Larkspur"]}
nb_rows = []
for b, names in BOROUGHS.items():
    base_inc = {"Harbourside": 98000, "Northgate": 76000, "Eastbank": 64000, "Westmoor": 55000}[b]
    for n in names:
        nb_rows.append((n, b, int(base_inc * rng.uniform(0.75, 1.3) // 100 * 100), int(rng.integers(35, 99))))
nbhd = pd.DataFrame(nb_rows, columns=["neighbourhood", "borough", "median_income", "transit_score"])

AMEN = ["gym", "doorman", "laundry", "parking", "balcony", "dishwasher", "elevator", "pets_allowed"]
AMEN_P = [0.3, 0.18, 0.55, 0.3, 0.35, 0.5, 0.45, 0.4]
AMEN_V = {"gym": 0.04, "doorman": 0.12, "laundry": 0.03, "parking": 0.05, "balcony": 0.05, "dishwasher": 0.02,
          "elevator": 0.03, "pets_allowed": 0.01}

N = 7000
nb_idx = rng.integers(len(nbhd), size=N)
beds = rng.choice([0, 1, 2, 3, 4], N, p=[0.14, 0.34, 0.3, 0.16, 0.06])
sqft = np.round(rng.normal(380 + 330 * beds, 90 + 30 * beds)).clip(250, 3200).astype(int)
baths = np.where(beds <= 1, 1, rng.choice([1, 1.5, 2, 2.5, 3], N, p=[0.3, 0.2, 0.3, 0.12, 0.08]))
baths = np.minimum(baths, np.maximum(1, beds))
year = rng.integers(1925, 2025, N)
floor = np.where(rng.random(N) < 0.18, 0, rng.integers(1, 35, N))
listed = pd.Timestamp("2026-01-01") + pd.to_timedelta(rng.integers(0, 270, N), unit="D")
furnished = rng.random(N) < 0.2
amen = [[a for a, p in zip(AMEN, AMEN_P) if rng.random() < p * (1.6 if a == "doorman" and floor[i] > 10 else 1)] for i in range(N)]

inc = nbhd.median_income.values[nb_idx] / 75000
transit = nbhd.transit_score.values[nb_idx] / 100
log_rent = (np.log(1450) + 0.62 * np.log(sqft / 700) + 0.55 * np.log(inc) + 0.22 * transit + 0.05 * beds
            + 0.0035 * np.minimum(floor, 30) + 0.0018 * (year - 1975) + 0.09 * furnished
            + np.array([sum(AMEN_V[a] for a in al) for al in amen])
            + 0.03 * (listed.month.values - 1) / 8 + rng.normal(0, 0.11, N))
rent = np.round(np.exp(log_rent) / 5) * 5

def messy_sqft(s):
    u = rng.random()
    return f"{s} sq ft" if u < 0.4 else (f"{s}sqft" if u < 0.55 else (f"{s:,} sq ft" if u < 0.6 else str(s)))
def messy_amen(al):
    if not al:
        return np.nan if rng.random() < 0.5 else ""
    al = list(al); rng.shuffle(al)
    return ";".join(a.upper() if rng.random() < 0.08 else (" " + a if rng.random() < 0.1 else a) for a in al)
def messy_nb(n):
    u = rng.random()
    return n.lower() if u < 0.15 else (n.upper() if u < 0.2 else (n + " " if u < 0.3 else n))

df = pd.DataFrame({
    "listing_id": rng.choice(np.arange(100000, 999999), N, replace=False),
    "neighbourhood": [messy_nb(n) for n in nbhd.neighbourhood.values[nb_idx]],
    "bedrooms": ["Studio" if b == 0 else str(b) for b in beds],
    "bathrooms": baths,
    "sqft": [messy_sqft(s) for s in sqft],
    "floor": ["G" if f == 0 else str(f) for f in floor],
    "year_built": year,
    "furnished": np.where(furnished, "yes", "no"),
    "amenities": [messy_amen(a) for a in amen],
    "listed_date": listed.strftime("%Y-%m-%d"),
    "rent": rent,
})
test_mask = rng.random(N) < 0.22
train, test = df[~test_mask].copy(), df[test_mask].copy()
# data-entry typos in train only: two extra zeros, or rent typed in thousands
ty = rng.choice(train.index, 45, replace=False)
train.loc[ty[:30], "rent"] = train.loc[ty[:30], "rent"] * 100
train.loc[ty[30:], "rent"] = (train.loc[ty[30:], "rent"] / 1000).round(1)
os.makedirs(DATA, exist_ok=True)
train.to_csv(os.path.join(DATA, "listings_train.csv"), index=False)
test.drop(columns="rent").to_csv(os.path.join(DATA, "listings_test.csv"), index=False)
nbhd.to_csv(os.path.join(DATA, "neighbourhoods.csv"), index=False)
test[["listing_id", "rent"]].to_csv(os.path.join(HERE, "test_labels.csv"), index=False)
print("train", train.shape, "test", test.shape, "rent median", train.rent.median())
subprocess.run([sys.executable, os.path.join(HERE, "solution.py")], check=True)
