from fastapi.testclient import TestClient

def test_create_object(client: TestClient):
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "test_obj", "label": "Test Object", "description": "A test object"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test_obj"
    assert "id" in data

def test_create_duplicate_object(client: TestClient):
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "test_obj", "label": "Test Object"}
    )
    assert response.status_code == 400

def test_add_field(client: TestClient):
    # Get object id first
    response = client.get("/api/v1/meta/objects")
    assert response.status_code == 200
    obj_id = response.json()[0]["id"]
    
    field_data = {
        "name": "test_field",
        "label": "Test Field",
        "data_type": "Text"
    }
    
    response = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json=field_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test_field"
    assert data["object_id"] == obj_id
