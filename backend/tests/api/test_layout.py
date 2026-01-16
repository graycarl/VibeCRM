from fastapi.testclient import TestClient

def test_layout_lifecycle(client: TestClient):
    # 1. Create Object first
    obj_res = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_layout_test", "label": "Layout Test"}
    )
    assert obj_res.status_code == 200
    obj_id = obj_res.json()["id"]

    # 2. Create Layout
    layout_data = {
        "name": "Default Layout",
        "config": {"sections": [{"name": "Basic Info", "fields": ["name", "score"]}]}
    }
    lay_res = client.post(
        f"/api/v1/meta/objects/{obj_id}/layouts",
        json=layout_data
    )
    assert lay_res.status_code == 200
    assert lay_res.json()["name"] == "Default Layout"

    # 3. Get Layouts
    get_res = client.get(f"/api/v1/meta/objects/{obj_id}/layouts")
    assert get_res.status_code == 200
    assert len(get_res.json()) >= 1

def test_listview_lifecycle(client: TestClient):
    # 1. Create Object
    obj_res = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_lv_test", "label": "LV Test"}
    )
    assert obj_res.status_code == 200
    obj_id = obj_res.json()["id"]

    # 2. Create List View
    lv_data = {
        "name": "All Items",
        "columns": ["name", "created_at"]
    }
    lv_res = client.post(
        f"/api/v1/meta/objects/{obj_id}/list-views",
        json=lv_data
    )
    assert lv_res.status_code == 200
    assert lv_res.json()["columns"] == ["name", "created_at"]

    # 3. Get List Views
    get_res = client.get(f"/api/v1/meta/objects/{obj_id}/list-views")
    assert get_res.status_code == 200
    assert len(get_res.json()) >= 1
