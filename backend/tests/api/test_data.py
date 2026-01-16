from fastapi.testclient import TestClient

def test_data_lifecycle(client: TestClient):
    # 1. Create Object
    obj_res = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_data_test", "label": "Data Test"}
    )
    assert obj_res.status_code == 200
    obj_id = obj_res.json()["id"]

    # 2. Add Field
    field_res = client.post(
        f"/api/v1/meta/objects/{obj_id}/fields",
        json={"name": "cs_score", "label": "Score", "data_type": "Number"}
    )
    assert field_res.status_code == 200

    # 3. Create Record
    record_data = {"cs_score": 99.5}
    rec_res = client.post(
        "/api/v1/data/cs_data_test",
        json=record_data
    )
    assert rec_res.status_code == 200
    rec = rec_res.json()
    assert rec["cs_score"] == 99.5
    assert "uid" in rec
    uid = rec["uid"]

    # 4. Get Record
    get_res = client.get(f"/api/v1/data/cs_data_test/{uid}")
    assert get_res.status_code == 200
    assert get_res.json()["cs_score"] == 99.5

    # 5. List Records
    list_res = client.get("/api/v1/data/cs_data_test")
    assert list_res.status_code == 200
    assert len(list_res.json()["items"]) >= 1
