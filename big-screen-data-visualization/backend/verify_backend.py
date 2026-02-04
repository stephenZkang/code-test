import pytest
from fastapi.testclient import TestClient
from database import engine, SessionLocal
import models
from main import app

client = TestClient(app)


def setup_module(module):
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)


def test_system_stats_and_alarms():
    # 1. Test system stats API
    response = client.get("/api/system/stats")
    assert response.status_code == 200
    data = response.json()
    assert "cpu" in data
    assert "memory" in data

    # 2. Test alarm creation via API
    alarm_data = {
        "level": "critical",
        "message": "Test Critical Alarm",
        "source": "pytest",
    }
    response = client.post("/api/alarms/", json=alarm_data)
    assert response.status_code == 200
    alarm_id = response.json()["id"]

    # 3. Test alarm retrieval
    response = client.get("/api/alarms/")
    assert response.status_code == 200
    alarms = response.json()
    assert len(alarms) >= 1
    assert alarms[0]["message"] == "Test Critical Alarm"

    # 4. Test mark as read
    response = client.put(f"/api/alarms/{alarm_id}/read")
    assert response.status_code == 200
    assert response.json()["is_read"] is True


if __name__ == "__main__":
    # Manual run if pytest is not available
    setup_module(None)
    test_system_stats_and_alarms()
    print("Verification Successful: Backend API flows are correct.")
