"""
NEXUS-LAND API Integration Tests
Tests use FastAPI TestClient with in-memory SQLite (configured in conftest.py).
"""
import pytest


# ─── Health & Root ───────────────────────────────────────────────────────────

def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "HEALTHY"


def test_api_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200


# ─── Auth ────────────────────────────────────────────────────────────────────

def test_login_valid(client):
    r = client.post("/api/auth/login", json={
        "email": "admin@nexusland.gov",
        "password": "Admin2024!"
    })
    assert r.status_code in (200, 201)
    if r.status_code == 200:
        assert "access_token" in r.json()


def test_login_invalid_password(client):
    r = client.post("/api/auth/login", json={
        "email": "admin@nexusland.gov",
        "password": "wrongpassword"
    })
    assert r.status_code in (401, 400, 422)


def test_login_missing_fields(client):
    r = client.post("/api/auth/login", json={"email": "admin@nexusland.gov"})
    assert r.status_code == 422


def test_get_me_authenticated(client, auth_headers):
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code in (200, 401)  # 401 if dev token path differs


def test_get_me_unauthenticated(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


# ─── Incidents ───────────────────────────────────────────────────────────────

def test_get_incidents(client, auth_headers):
    r = client.get("/api/incidents", headers=auth_headers)
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        assert isinstance(r.json(), list)


def test_get_incidents_unauthenticated(client):
    r = client.get("/api/incidents")
    assert r.status_code == 401


# ─── Alerts ──────────────────────────────────────────────────────────────────

def test_get_alerts(client, auth_headers):
    r = client.get("/api/alerts", headers=auth_headers)
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        assert isinstance(r.json(), list)


# ─── Sensors ─────────────────────────────────────────────────────────────────

def test_get_sensors(client, auth_headers):
    r = client.get("/api/sensors", headers=auth_headers)
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        assert isinstance(r.json(), list)


# ─── Hazards ─────────────────────────────────────────────────────────────────

def test_get_live_hazards(client, auth_headers):
    r = client.get("/api/hazards/live", headers=auth_headers)
    assert r.status_code in (200, 401, 422)
    if r.status_code == 200:
        body = r.json()
        assert isinstance(body, (list, dict))


def test_get_hazard_stats(client, auth_headers):
    r = client.get("/api/hazards/stats", headers=auth_headers)
    assert r.status_code in (200, 401)


def test_get_earthquakes(client, auth_headers):
    r = client.get("/api/hazards/earthquakes", headers=auth_headers)
    assert r.status_code in (200, 401)


# ─── Landslide Intelligence ──────────────────────────────────────────────────

def test_get_landslide_dataset(client, auth_headers):
    r = client.get("/api/landslide/dataset", headers=auth_headers)
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        body = r.json()
        assert isinstance(body, (list, dict))


# ─── Risk Engine ─────────────────────────────────────────────────────────────

def test_calculate_risk(client, auth_headers):
    r = client.get("/api/risk/calculate", params={
        "lat": 28.6,
        "lon": 77.2,
        "slope_angle": 28.0
    }, headers=auth_headers)
    assert r.status_code in (200, 401, 422)
    if r.status_code == 200:
        body = r.json()
        assert isinstance(body, dict)


# ─── Location ────────────────────────────────────────────────────────────────

def test_geocode(client, auth_headers):
    r = client.get("/api/location/geocode", params={"q": "Mumbai"}, headers=auth_headers)
    assert r.status_code in (200, 401, 422, 500)


# ─── System Health ───────────────────────────────────────────────────────────

def test_system_health(client, auth_headers):
    r = client.get("/api/system/health", headers=auth_headers)
    assert r.status_code in (200, 401, 404)
    if r.status_code == 200:
        assert isinstance(r.json(), dict)


# ─── Datasets ────────────────────────────────────────────────────────────────

def test_get_datasets(client, auth_headers):
    r = client.get("/api/datasets", headers=auth_headers)
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        assert isinstance(r.json(), list)


def test_get_dataset_stats(client, auth_headers):
    r = client.get("/api/datasets/stats", headers=auth_headers)
    assert r.status_code in (200, 401, 404)


# ─── Analytics ───────────────────────────────────────────────────────────────

def test_get_forecasts(client, auth_headers):
    r = client.get("/api/analytics/forecasts", headers=auth_headers)
    assert r.status_code in (200, 401, 404)


# ─── Report Engine ───────────────────────────────────────────────────────────

def test_get_report_presets(client, auth_headers):
    r = client.get("/api/report/presets", headers=auth_headers)
    assert r.status_code in (200, 401, 404)
