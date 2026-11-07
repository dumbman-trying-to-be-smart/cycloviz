"""
API tests for backend/main.py.

Run from the repo root:  python -m pytest tests -v
"""
import os
import sys
from pathlib import Path

import pytest

# backend/main.py loads CSVs from "data/..." relative to the working directory,
# so make sure we import it from the repo root.
ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402
from backend.main import app  # noqa: E402

client = TestClient(app)

STREETS = client.get("/sensors").json()["sensors"]
STREET = "Jagtvej"
UNKNOWN = "Not A Real Street"
STREET_SUBROUTES = ["hourly", "daily", "monthly", "yearly"]


# ---------- basic routes ----------

def test_home():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Welcome to CycloViz API"}


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_unknown_route_404():
    assert client.get("/does-not-exist").status_code == 404


# ---------- /sensors ----------

def test_sensors_lists_13_unique_streets():
    r = client.get("/sensors")
    assert r.status_code == 200
    sensors = r.json()["sensors"]
    assert len(sensors) == 13
    assert len(set(sensors)) == len(sensors)
    assert STREET in sensors


@pytest.mark.parametrize("street", STREETS)
def test_street_summary_for_every_sensor(street):
    r = client.get(f"/sensors/{street}")
    assert r.status_code == 200
    body = r.json()
    assert body["street"] == street
    assert set(body) == {"street", "avg_cyclists_per_hour", "avg_daily_total", "cluster"}
    assert isinstance(body["avg_cyclists_per_hour"], int)
    assert body["avg_cyclists_per_hour"] >= 0
    # a day has 24 hours, so the daily total should be well above the hourly average
    assert body["avg_daily_total"] >= body["avg_cyclists_per_hour"]


def test_street_summary_unknown_404():
    r = client.get(f"/sensors/{UNKNOWN}")
    assert r.status_code == 404
    assert r.json()["detail"] == "Street not found"


# ---------- /sensors/{street}/hourly|daily|monthly|yearly ----------

@pytest.mark.parametrize("sub", STREET_SUBROUTES)
def test_street_subroute_unknown_404(sub):
    r = client.get(f"/sensors/{UNKNOWN}/{sub}")
    assert r.status_code == 404
    assert r.json()["detail"] == "Street not found"


def test_hourly():
    rows = client.get(f"/sensors/{STREET}/hourly").json()["hourly"]
    hours = [row["hour"] for row in rows]
    assert hours == sorted(hours)
    assert all(0 <= h <= 23 for h in hours)
    assert all(set(row) == {"hour", "avg_cyclists"} for row in rows)
    assert all(row["avg_cyclists"] >= 0 for row in rows)


def test_daily_covers_weekdays_0_to_6():
    rows = client.get(f"/sensors/{STREET}/daily").json()["daily"]
    assert [row["day"] for row in rows] == list(range(7))
    assert all(row["avg_cyclists"] >= 0 for row in rows)


def test_monthly_months_in_range():
    rows = client.get(f"/sensors/{STREET}/monthly").json()["monthly"]
    months = [row["month"] for row in rows]
    assert months == sorted(months)
    assert all(1 <= m <= 12 for m in months)


def test_yearly_filters_low_years():
    rows = client.get(f"/sensors/{STREET}/yearly").json()["yearly"]
    assert all(2005 <= row["year"] <= 2014 for row in rows)
    # the endpoint drops years with an average daily total of 500 or less
    assert all(row["avg_cyclists"] > 500 for row in rows)


@pytest.mark.parametrize("sub", STREET_SUBROUTES)
def test_street_subroute_works_for_every_sensor(sub):
    for street in STREETS:
        r = client.get(f"/sensors/{street}/{sub}")
        assert r.status_code == 200, f"{street}/{sub}"
        assert sub in r.json()


# ---------- /clusters and /cluster/{name} ----------

def test_clusters_list():
    rows = client.get("/clusters").json()["cluster"]
    assert len(rows) > 0
    assert all(set(row) == {"road_name", "cluster_name"} for row in rows)


def test_each_cluster_lookup_returns_its_streets():
    rows = client.get("/clusters").json()["cluster"]
    for name in {row["cluster_name"] for row in rows}:
        r = client.get(f"/cluster/{name}")
        assert r.status_code == 200
        expected = [row["road_name"] for row in rows if row["cluster_name"] == name]
        assert sorted(r.json()["street_names"]) == sorted(expected)


def test_cluster_unknown_404():
    r = client.get("/cluster/Not A Cluster")
    assert r.status_code == 404
    assert r.json()["detail"] == "Cluster not found"


def test_street_cluster_matches_clusters_endpoint():
    mapping = {row["road_name"]: row["cluster_name"]
               for row in client.get("/clusters").json()["cluster"]}
    body = client.get(f"/sensors/{STREET}").json()
    assert body["cluster"] == mapping.get(STREET)


# ---------- /compare ----------

def test_compare_two_streets():
    other = next(s for s in STREETS if s != STREET)
    r = client.get("/compare", params={"street_a": STREET, "street_b": other})
    assert r.status_code == 200
    body = r.json()
    assert body["street_a"]["street"] == STREET
    assert body["street_b"]["street"] == other


def test_compare_matches_single_street_summary():
    other = next(s for s in STREETS if s != STREET)
    body = client.get("/compare", params={"street_a": STREET, "street_b": other}).json()
    assert body["street_a"] == client.get(f"/sensors/{STREET}").json()
    assert body["street_b"] == client.get(f"/sensors/{other}").json()


def test_compare_same_street_twice():
    body = client.get("/compare", params={"street_a": STREET, "street_b": STREET}).json()
    assert body["street_a"] == body["street_b"]


@pytest.mark.parametrize("a,b", [(UNKNOWN, STREET), (STREET, UNKNOWN)])
def test_compare_unknown_street_404(a, b):
    r = client.get("/compare", params={"street_a": a, "street_b": b})
    assert r.status_code == 404
    assert UNKNOWN in r.json()["detail"]


@pytest.mark.parametrize("params", [{}, {"street_a": STREET}, {"street_b": STREET}])
def test_compare_missing_params_422(params):
    assert client.get("/compare", params=params).status_code == 422


# ---------- /weather/impact ----------

def test_weather_impact_categories():
    r = client.get("/weather/impact")
    assert r.status_code == 200
    body = r.json()
    assert set(body["rain_impact"]) <= {"Dry", "Light rain", "Heavy rain"}
    assert set(body["temp_impact"]) <= {"Cold", "Mild", "Warm"}
    assert set(body["wind_impact"]) <= {"Calm", "Moderate", "Windy"}
    for group in body.values():
        assert len(group) > 0
        assert all(isinstance(v, int) and v >= 0 for v in group.values())


# ---------- /map ----------

def test_map_sensors_are_in_copenhagen():
    sensors = client.get("/map").json()["sensors"]
    assert len(sensors) > 0
    for s in sensors:
        assert set(s) == {"road_name", "lat", "lng", "cluster_name", "avg_cyclists_per_hour"}
        assert 55.5 < s["lat"] < 55.8, s["road_name"]
        assert 12.3 < s["lng"] < 12.7, s["road_name"]


def test_map_average_matches_street_summary():
    for s in client.get("/map").json()["sensors"]:
        if s["avg_cyclists_per_hour"] is None:
            continue
        summary = client.get(f"/sensors/{s['road_name']}").json()
        assert s["avg_cyclists_per_hour"] == summary["avg_cyclists_per_hour"]


# ---------- CORS ----------

def test_cors_allows_any_origin():
    r = client.get("/sensors", headers={"Origin": "http://localhost:5173"})
    assert r.headers.get("access-control-allow-origin") == "*"
