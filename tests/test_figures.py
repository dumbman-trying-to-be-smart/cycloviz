import pandas as pd
import pytest
from fastapi.testclient import TestClient
 
from backend.main import app
 
client = TestClient(app)
 
raw = pd.read_csv("data/total_rides.csv").dropna()
raw["hour"] = raw["time"].str.split("-").str[0].astype(int)
raw["date"] = pd.to_datetime(raw["date"])
raw["day"] = raw["date"].dt.dayofweek
raw["month"] = raw["date"].dt.month
STREETS = sorted(raw["road_name"].unique())
 
 
def test_cleaned_file_has_expected_size():
    assert len(raw) == 683373
    assert len(STREETS) == 13
 
 
@pytest.mark.parametrize("street", STREETS)
def test_summary_matches_csv(street):
    d = raw[raw["road_name"] == street]
    body = client.get(f"/sensors/{street}").json()
    assert body["avg_cyclists_per_hour"] == round(d["n"].mean())
    assert body["avg_daily_total"] == round(d.groupby("date")["n"].sum().mean())
 
 
@pytest.mark.parametrize("street", STREETS)
@pytest.mark.parametrize("path,key,col", [("hourly", "hourly", "hour"),
                                          ("daily", "daily", "day"),
                                          ("monthly", "monthly", "month")])
def test_profiles_match_csv(street, path, key, col):
    d = raw[raw["road_name"] == street]
    got = {r[col]: r["avg_cyclists"] for r in client.get(f"/sensors/{street}/{path}").json()[key]}
    want = d.groupby(col)["n"].mean().round().astype(int).to_dict()
    assert got == want