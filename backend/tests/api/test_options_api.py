from fastapi.testclient import TestClient
from app.services.meta_service import meta_service
from app.schemas.metadata import MetaFieldCreate

def test_options_crud_api(client: TestClient, db):
    # 1. Setup a picklist field
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="api_picklist",
        label="API Picklist",
        data_type="Picklist",
        options=[]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    # 2. Add option via API
    response = client.post(
        f"/api/v1/meta/fields/{field.id}/options",
        json={"name": "opt1", "label": "Option 1"}
    )
    assert response.status_code == 201
    
    # 3. Update option via API
    response = client.patch(
        f"/api/v1/meta/fields/{field.id}/options/opt1",
        json={"label": "Option 1 Updated"}
    )
    assert response.status_code == 200
    
    # 4. Verify updated label
    db.expire_all()
    obj_refreshed = meta_service.get_object(db, obj.id)
    field_refreshed = next(f for f in obj_refreshed.fields if f.id == field.id)
    assert field_refreshed.options[0]["label"] == "Option 1 Updated"
    
    # 5. Delete option via API
    response = client.delete(f"/api/v1/meta/fields/{field.id}/options/opt1")
    assert response.status_code == 200
    
    # 6. Verify deleted
    db.expire_all()
    field_refreshed = meta_service.get_field(db, field.id)
    assert len(field_refreshed.options) == 0

def test_add_option_invalid_name(client: TestClient, db):
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="api_picklist_invalid",
        label="API Picklist Invalid",
        data_type="Picklist",
        options=[]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    response = client.post(
        f"/api/v1/meta/fields/{field.id}/options",
        json={"name": "1invalid", "label": "Invalid"}
    )
    assert response.status_code == 400
    assert "Option name must be" in response.json()["detail"]
