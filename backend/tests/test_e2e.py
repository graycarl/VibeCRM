from fastapi.testclient import TestClient
import pytest

def test_full_platform_flow(client: TestClient):
    # 1. Create Custom Object 'Lead'
    obj_res = client.post(
        "/api/v1/meta/objects",
        json={"name": "cs_lead", "label": "Lead"}
    )
    assert obj_res.status_code == 200
    obj_id = obj_res.json()["id"]
    
    # 2. Add Fields to 'Lead'
    client.post(f"/api/v1/meta/objects/{obj_id}/fields", json={"name": "cs_company", "label": "Company", "data_type": "Text"})
    client.post(f"/api/v1/meta/objects/{obj_id}/fields", json={"name": "cs_revenue", "label": "Revenue", "data_type": "Number"})
    
    # 3. Create Page Layout
    client.post(f"/api/v1/meta/objects/{obj_id}/layouts", json={
        "name": "Lead Layout",
        "config": {"sections": [{"name": "Main", "fields": ["cs_company", "cs_revenue"]}]}
    })
    
    # 4. Create a Lead Record
    rec_res = client.post("/api/v1/data/cs_lead", json={"cs_company": "VibeCorp", "cs_revenue": 5000000})
    assert rec_res.status_code == 200
    rec_uid = rec_res.json()["uid"]
    
    # 5. Verify Record
    get_res = client.get(f"/api/v1/data/cs_lead/{rec_uid}")
    assert get_res.status_code == 200
    assert get_res.json()["cs_company"] == "VibeCorp"
    assert get_res.json()["cs_revenue"] == 5000000
