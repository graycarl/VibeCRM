from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate

def test_pagination_response_structure(client: TestClient, db: Session):
    # 1. Create a custom object
    obj_data = MetaObjectCreate(
        name="cs_test_pagination",
        label="Test Pagination",
        description="Object for pagination test"
    )
    obj = meta_service.create_object(db, obj_data)

    # 1.5 Create a 'name' field for the object so we can store data
    name_field = MetaFieldCreate(
        name="cs_name",
        label="Name",
        data_type="Text",
        is_required=True
    )
    meta_service.create_field(db, obj.id, name_field)
    
    # 2. Create 55 records
    for i in range(55):
        data_service.create_record(db, "cs_test_pagination", {"cs_name": f"Record {i}"})
        
    # 3. Test default pagination (limit=50)
    response = client.get("/api/v1/data/cs_test_pagination")
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert "items" in data
    assert "total" in data
    
    # Verify default values
    assert len(data["items"]) == 50
    assert data["total"] == 55
    
    # 4. Test page 2 (skip=50)
    response = client.get("/api/v1/data/cs_test_pagination?skip=50&limit=50")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 5
    assert data["total"] == 55
    
    # 5. Test custom page size (limit=10)
    response = client.get("/api/v1/data/cs_test_pagination?limit=10")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 10
    assert data["total"] == 55
