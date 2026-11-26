#!/usr/bin/env python3
"""Reference solution for Harbor Homes rent: writes _hidden/answers.json, prints reference RMSEs."""
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
nbhd = pd.read_csv(os.path.join(DATA, "neighbourhoods.csv"))


def clean(df):
    df = df.copy()
    df["neighbourhood"] = df["neighbourhood"].str.strip().str.title()
    df["bedrooms"] = df["bedrooms"].replace("Studio", "0").astype(int)
    df["sqft"] = df["sqft"].astype(str).str.replace(",", "", regex=False).str.extract(r"(\d+)")[0].astype(int)
    df["floor"] = df["floor"].replace("G", "0").astype(int)
    df["furnished"] = (df["furnished"] == "yes").astype(int)
    df["amen_list"] = df["amenities"].fillna("").apply(
        lambda s: sorted({a.strip().lower() for a in s.split(";") if a.strip()}))
    return df.merge(nbhd, on="neighbourhood", how="left")


train = clean(pd.read_csv(os.path.join(DATA, "listings_train.csv")))
train = train[(train["rent"] >= 300) & (train["rent"] <= 50000)]
test = clean(pd.read_csv(os.path.join(DATA, "listings_test.csv")))
assert train["borough"].notna().all() and test["borough"].notna().all()

ex = train.explode("amen_list")
has_door = train["amen_list"].apply(lambda l: "doorman" in l)
answers = {
    "task1_n_rows": int(len(train)),
    "task1_median_rent_by_bedrooms": {str(k): round(float(v), 1) for k, v in train.groupby("bedrooms")["rent"].median().items()},
    "task1_median_rent_per_sqft": round(float((train["rent"] / train["sqft"]).median()), 3),
    "task2_amenity_counts": {k: int(v) for k, v in ex["amen_list"].dropna().value_counts().items()},
    "task2_doorman_premium": round(float(train.loc[has_door, "rent"].median() - train.loc[~has_door, "rent"].median()), 1),
    "task3_median_rent_by_borough": {k: round(float(v), 1) for k, v in train.groupby("borough")["rent"].median().items()},
    "task3_corr_income_rent": round(float(train["median_income"].corr(train["rent"])), 3),
}
json.dump(answers, open(os.path.join(HERE, "answers.json"), "w"), indent=1)
print(json.dumps(answers, indent=1))

AMEN = sorted(answers["task2_amenity_counts"])


def feats(df):
    X = df[["bedrooms", "bathrooms", "sqft", "floor", "year_built", "furnished", "median_income", "transit_score"]].copy()
    X["log_sqft"] = np.log(df["sqft"])
    X["month"] = pd.to_datetime(df["listed_date"]).dt.month
    for a in AMEN:
        X["a_" + a] = df["amen_list"].apply(lambda l: a in l).astype(int)
    return X.join(pd.get_dummies(df["borough"], dtype=int))


Xtr, Xte = feats(train), feats(test)
y = train["rent"]
labels = pd.read_csv(os.path.join(HERE, "test_labels.csv"))
yte = test[["listing_id"]].merge(labels, on="listing_id")["rent"]
rmse = lambda a, b: float(np.sqrt(mean_squared_error(a, b)))
print("mean predictor RMSE %.1f" % rmse(yte, np.full(len(yte), y.mean())))
print("ridge sqft-only RMSE %.1f" % rmse(yte, Ridge().fit(Xtr[["sqft"]], y).predict(Xte[["sqft"]])))
print("ridge all RMSE %.1f" % rmse(yte, Ridge().fit(Xtr, y).predict(Xte)))
print("ridge log-target RMSE %.1f" % rmse(yte, np.exp(Ridge().fit(Xtr, np.log(y)).predict(Xte))))
print("RF RMSE %.1f" % rmse(yte, RandomForestRegressor(300, min_samples_leaf=3, random_state=0, n_jobs=-1).fit(Xtr, y).predict(Xte)))
print("HGB RMSE %.1f" % rmse(yte, HistGradientBoostingRegressor(max_iter=400, learning_rate=0.05, random_state=0).fit(Xtr, y).predict(Xte)))
# what happens if typos are not removed
raw = clean(pd.read_csv(os.path.join(DATA, "listings_train.csv")))
print("HGB with typos left in RMSE %.1f" % rmse(yte, HistGradientBoostingRegressor(random_state=0).fit(feats(raw), raw["rent"]).predict(Xte)))
