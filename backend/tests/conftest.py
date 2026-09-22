"""
Pytest configuration for NEXUS-LAND backend tests.
Uses in-memory SQLite and overrides FastAPI's DB dependency.
"""
import os
import pytest

# Must be set before any app import
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("BACKEND_URL", "http://testserver")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from database import Base, get_db
from main import app

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def client(setup_database):
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(scope="session")
def auth_headers(client):
    resp = client.post("/api/auth/login", json={
        "email": "admin@nexusland.gov",
        "password": "Admin2024!"
    })
    if resp.status_code == 200:
        token = resp.json().get("access_token", "")
    else:
        token = "dev_mock_google_token"
    return {"Authorization": f"Bearer {token}"}
