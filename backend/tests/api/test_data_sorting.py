import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate
import uuid

client = TestClient(app)

@pytest.fixture(scope="function")
def sorting_setup(db):
    # Setup metadata
    obj_name = f"cs_sort_{uuid.uuid4().hex[:6]}"
    obj_in = MetaObjectCreate(name=obj_name, label="Sorting Object", description="For sorting test")
    obj = meta_service.create_object(db, obj_in)
    
    # Create fields
    field_num = MetaFieldCreate(name="cs_amount", label="Amount", data_type="Number")
    meta_service.create_field(db, obj.id, field_num)

    field_date = MetaFieldCreate(name="cs_event_date", label="Event Date", data_type="Date")
    meta_service.create_field(db, obj.id, field_date)
    
    # Create records
    data_service.create_record(db, obj_name, {"cs_amount": 10, "cs_event_date": "2023-01-01"})
    data_service.create_record(db, obj_name, {"cs_amount": 30, "cs_event_date": "2023-03-01"})
    data_service.create_record(db, obj_name, {"cs_amount": 20, "cs_event_date": "2023-02-01"})
    
    return obj_name

def test_list_records_sorting_number_asc(client: TestClient, db: Session, sorting_setup):
    obj_name = sorting_setup
    
    # Test Sort Number ASC
    response = client.get(f"/api/v1/data/{obj_name}?sort_field=cs_amount&sort_order=asc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 3
    assert items[0]["cs_amount"] == 10
    assert items[1]["cs_amount"] == 20
    assert items[2]["cs_amount"] == 30

def test_list_records_sorting_number_desc(client: TestClient, db: Session, sorting_setup):
    obj_name = sorting_setup
    
    # Test Sort Number DESC
    response = client.get(f"/api/v1/data/{obj_name}?sort_field=cs_amount&sort_order=desc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cs_amount"] == 30
    assert items[1]["cs_amount"] == 20
    assert items[2]["cs_amount"] == 10

def test_list_records_sorting_date_asc(client: TestClient, db: Session, sorting_setup):
    obj_name = sorting_setup
    
    # Test Sort Date ASC
    response = client.get(f"/api/v1/data/{obj_name}?sort_field=cs_event_date&sort_order=asc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cs_event_date"] == "2023-01-01"
    assert items[1]["cs_event_date"] == "2023-02-01"
    assert items[2]["cs_event_date"] == "2023-03-01"

def test_list_records_sorting_invalid_field(client: TestClient, db: Session, sorting_setup):
    obj_name = sorting_setup
    
    # Test Invalid Field: both sort_field and sort_order are ignored, falling back to default created_at DESC.
    # The default creation order is 10, 30, 20. 
    # created_at DESC means 20 (newest), 30, 10 (oldest), regardless of the provided sort_order=asc.
    response = client.get(f"/api/v1/data/{obj_name}?sort_field=invalid_field&sort_order=asc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["cs_amount"] == 20
    assert items[1]["cs_amount"] == 30
    assert items[2]["cs_amount"] == 10

def test_list_records_sorting_system_field(client: TestClient, db: Session, sorting_setup):
    obj_name = sorting_setup
    
    # Test System Field created_at ASC
    response = client.get(f"/api/v1/data/{obj_name}?sort_field=created_at&sort_order=asc")
    assert response.status_code == 200
    items = response.json()["items"]
    # Created order: 10, 30, 20
    assert items[0]["cs_amount"] == 10
    assert items[1]["cs_amount"] == 30
    assert items[2]["cs_amount"] == 20
