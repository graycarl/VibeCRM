from fastapi.testclient import TestClient

def test_create_object(client: TestClient):
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_test_obj", "label": "Test Object", "description": "A test object"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "cs_test_obj"
    assert "id" in data

def test_create_duplicate_object(client: TestClient):
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_test_obj", "label": "Test Object"}
    )
    assert response.status_code == 400

def test_add_field(client: TestClient):
    # Get object id first
    response = client.get("/api/v1/meta/objects")
    assert response.status_code == 200
    obj_id = response.json()[0]["id"]
    
    field_data = {
        "name": "cs_test_field",
        "label": "Test Field",
        "data_type": "Text"
    }
    
    response = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json=field_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "cs_test_field"
    assert data["object_id"] == obj_id

def test_role_crud(client: TestClient):
    # 1. Create Role
    role_data = {
        "name": "cs_sales_manager",
        "label": "Sales Manager",
        "description": "Manages sales team",
        "permissions": {"object:view": "all"}
    }
    response = client.post("/api/v1/meta/roles", json=role_data)
    assert response.status_code == 200
    created_role = response.json()
    assert created_role["name"] == "cs_sales_manager"
    assert created_role["id"] is not None
    
    role_id = created_role["id"]

    # 2. Get Role
    response = client.get(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "cs_sales_manager"

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
    assert updated_role["name"] == "cs_sales_manager" # Name should not change if not provided

    # 5. Delete Role
    response = client.delete(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 200
    
    # Verify deletion
    response = client.get(f"/api/v1/meta/roles/{role_id}")
    assert response.status_code == 404

def test_create_duplicate_role(client: TestClient):
    role_data = {
        "name": "cs_support_agent",
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


# ===== Custom Prefix Validation Tests =====

def test_create_custom_object_without_prefix_fails(client: TestClient):
    """source=custom Object must have name starting with cs_"""
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "my_object", "label": "My Object", "source": "custom"}
    )
    assert response.status_code == 400
    assert "cs_" in response.json()["detail"]

def test_create_custom_object_with_prefix_succeeds(client: TestClient):
    """source=custom Object with cs_ prefix should succeed"""
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_my_object", "label": "My Object", "source": "custom"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "cs_my_object"

def test_create_system_object_without_prefix_succeeds(client: TestClient):
    """source=system Object does not require cs_ prefix"""
    response = client.post(
        "/api/v1/meta/objects",
        json={"name": "system_object", "label": "System Object", "source": "system"}
    )
    assert response.status_code == 200

def test_create_custom_field_without_prefix_fails(client: TestClient):
    """source=custom Field must have name starting with cs_"""
    # Get an object first
    response = client.get("/api/v1/meta/objects")
    obj_id = response.json()[0]["id"]
    
    response = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json={"name": "my_field", "label": "My Field", "data_type": "Text", "source": "custom"}
    )
    assert response.status_code == 400
    assert "cs_" in response.json()["detail"]

def test_create_custom_field_with_prefix_succeeds(client: TestClient):
    """source=custom Field with cs_ prefix should succeed"""
    response = client.get("/api/v1/meta/objects")
    obj_id = response.json()[0]["id"]
    
    response = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json={"name": "cs_my_field", "label": "My Field", "data_type": "Text", "source": "custom"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "cs_my_field"

def test_create_system_field_without_prefix_succeeds(client: TestClient):
    """source=system Field does not require cs_ prefix"""
    response = client.get("/api/v1/meta/objects")
    obj_id = response.json()[0]["id"]
    
    response = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json={"name": "system_field", "label": "System Field", "data_type": "Text", "source": "system"}
    )
    assert response.status_code == 200

def test_create_custom_role_without_prefix_fails(client: TestClient):
    """source=custom Role must have name starting with cs_"""
    response = client.post(
        "/api/v1/meta/roles",
        json={"name": "my_role", "label": "My Role", "source": "custom"}
    )
    assert response.status_code == 400
    assert "cs_" in response.json()["detail"]

def test_create_custom_role_with_prefix_succeeds(client: TestClient):
    """source=custom Role with cs_ prefix should succeed"""
    response = client.post(
        "/api/v1/meta/roles",
        json={"name": "cs_my_role", "label": "My Role", "source": "custom"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "cs_my_role"

def test_create_system_role_without_prefix_succeeds(client: TestClient):
    """source=system Role does not require cs_ prefix"""
    response = client.post(
        "/api/v1/meta/roles",
        json={"name": "system_role", "label": "System Role", "source": "system"}
    )
    assert response.status_code == 200

