from sqlalchemy.orm import Session
from app.services.data_service import data_service
from datetime import datetime, timezone
import time

def test_create_record_timestamps(db: Session):
    # Test for 'account' object which is seeded
    data = {"name": "Test Account", "age": 25}
    record = data_service.create_record(db, "account", data)
    
    assert "created_on" in record
    assert "modified_on" in record
    assert record["name"] == "Test Account"
    
    # Verify they are ISO strings
    created_on = datetime.fromisoformat(record["created_on"])
    
    # Should be close to now
    now = datetime.now(timezone.utc)
    assert (now - created_on).total_seconds() < 10
    assert record["created_on"] == record["modified_on"]

def test_create_record_protects_timestamps(db: Session):
    # Try to override timestamps during create
    fake_time = "2000-01-01T00:00:00+00:00"
    data = {
        "name": "Evil Account", 
        "created_on": fake_time,
        "modified_on": fake_time,
        "uid": "fake-uid",
        "id": 9999
    }
    record = data_service.create_record(db, "account", data)
    
    assert record["created_on"] != fake_time
    assert record["modified_on"] != fake_time
    assert record["uid"] != "fake-uid"
    assert record["id"] != 9999
    assert record["name"] == "Evil Account"

def test_update_record_timestamps(db: Session):
    # Create a record first
    data = {"name": "Update Test"}
    record = data_service.create_record(db, "account", data)
    original_created_on = record["created_on"]
    original_modified_on = record["modified_on"]
    uid = record["uid"]
    
    # Wait a bit to ensure timestamp changes
    time.sleep(0.1)
    
    # Update record
    update_data = {"name": "Updated Name"}
    updated_record = data_service.update_record(db, "account", uid, update_data)
    
    assert updated_record["name"] == "Updated Name"
    assert updated_record["created_on"] == original_created_on
    assert updated_record["modified_on"] != original_modified_on
    
    # Verify modified_on is newer
    modified_on = datetime.fromisoformat(updated_record["modified_on"])
    original_on = datetime.fromisoformat(original_modified_on)
    assert modified_on > original_on

def test_update_record_protects_timestamps(db: Session):
    # Create a record
    record = data_service.create_record(db, "account", {"name": "Protect Test"})
    uid = record["uid"]
    original_created_on = record["created_on"]
    
    # Try to update created_on and uid
    fake_time = "1990-01-01T00:00:00+00:00"
    update_data = {
        "name": "New Name",
        "created_on": fake_time,
        "uid": "new-uid",
        "id": 123
    }
    updated_record = data_service.update_record(db, "account", uid, update_data)
    
    assert updated_record["name"] == "New Name"
    assert updated_record["created_on"] == original_created_on
    assert updated_record["uid"] == uid
    assert updated_record["id"] == record["id"]
