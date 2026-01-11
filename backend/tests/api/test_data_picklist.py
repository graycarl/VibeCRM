import pytest
from fastapi.testclient import TestClient
from app.services.meta_service import meta_service
from app.schemas.metadata import MetaFieldCreate

def test_create_record_with_picklist(client: TestClient, db):
    # 1. Setup a picklist field
    obj = meta_service.get_object_by_name(db, "account")
    field_name = "test_sex"
    field_in = MetaFieldCreate(
        name=field_name,
        label="测试性别",
        data_type="Picklist",
        options=[
            {"name": "male", "label": "男"},
            {"name": "female", "label": "女"}
        ]
    )
    meta_service.create_field(db, obj.id, field_in)
    
    # 2. Create record with valid picklist value
    response = client.post(
        "/api/v1/data/account",
        json={"name": "Test Picklist", field_name: "male"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data[field_name] == "male"
    
    # 3. Create record with invalid picklist value
    response = client.post(
        "/api/v1/data/account",
        json={"name": "Test Invalid", field_name: "invalid"}
    )
    assert response.status_code == 400
    assert "Invalid value" in response.json()["detail"]
