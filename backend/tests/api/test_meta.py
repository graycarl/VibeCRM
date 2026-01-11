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

def test_role_crud(client: TestClient):
    # 1. Create Role
    role_data = {
        "name": "sales_manager",
        "label": "Sales Manager",
        "description": "Manages sales team",
        "permissions": {"object:view": "all"}
    }
    response = client.post("/api/v1/meta/roles", json=role_data)
    assert response.status_code == 200
    created_role = response.json()
    assert created_role["name"] == "sales_manager"
    assert created_role["id"] is not None
    
    role_id = created_role["id"]

    # 2. Get Role
    response = client.get(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "sales_manager"

    # 3. List Roles
    response = client.get("/api/v1/meta/roles")
    assert response.status_code == 200
    roles = response.json()
    assert any(r["id"] == role_id for r in roles)

    # 4. Update Role
    update_data = {
        "label": "Regional Sales Manager",
        "description": "Updated description"
    }
    response = client.put(f"/api/v1/meta/roles/{role_id}", json=update_data)
    assert response.status_code == 200
    updated_role = response.json()
    assert updated_role["label"] == "Regional Sales Manager"
    assert updated_role["description"] == "Updated description"
    assert updated_role["name"] == "sales_manager" # Name should not change if not provided

    # 5. Delete Role
    response = client.delete(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 200
    
    # Verify deletion
    response = client.get(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 404

def test_create_duplicate_role(client: TestClient):
    role_data = {
        "name": "support_agent",
        "label": "Support Agent"
    }
    # First creation
    response = client.post("/api/v1/meta/roles", json=role_data)
    assert response.status_code == 200
    
    # Duplicate creation
    response = client.post("/api/v1/meta/roles", json=role_data)
    assert response.status_code == 400

def test_delete_system_role(client: TestClient):
    role_data = {
        "name": "system_admin_test",
        "label": "System Admin Test",
        "source": "system"
    }
    response = client.post("/api/v1/meta/roles", json=role_data)
    assert response.status_code == 200
    role_id = response.json()["id"]

    # Attempt delete
    response = client.delete(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 400
    assert "Cannot delete system role" in response.json()["detail"]

