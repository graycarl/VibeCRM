import pytest
from app.services.data_service import data_service
from app.services.meta_service import meta_service
from app.schemas.metadata import MetaFieldCreate

def test_picklist_validation(db):
    # 1. Setup picklist field
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="cs_status",
        label="状态",
        data_type="Picklist",
        options=[
            {"name": "active", "label": "启用"},
            {"name": "inactive", "label": "禁用"}
        ]
    )
    meta_service.create_field(db, obj.id, field_in)
    
    # 2. Valid value
    data_service.create_record(db, "account", {"name": "Valid", "cs_status": "active"})
    
    # 3. Invalid value
    with pytest.raises(ValueError, match="Invalid value 'deleted'"):
        data_service.create_record(db, "account", {"name": "Invalid", "cs_status": "deleted"})
    
    # 4. Null value (if not required)
    data_service.create_record(db, "account", {"name": "Null Status", "cs_status": None})
    data_service.create_record(db, "account", {"name": "Empty Status", "cs_status": ""})

def test_update_picklist_validation(db):
    obj = meta_service.get_object_by_name(db, "account")
    # Field already created in previous test if module scoped, but here it's fresh per test usually if not careful.
    # In conftest.py, db is module scoped.
    
    # Let's ensure the field exists
    field = next((f for f in obj.fields if f.name == "cs_status"), None)
    if not field:
        field_in = MetaFieldCreate(
            name="cs_status",
            label="状态",
            data_type="Picklist",
            options=[{"name": "active", "label": "启用"}]
        )
        meta_service.create_field(db, obj.id, field_in)

    rec = data_service.create_record(db, "account", {"name": "Update Test", "cs_status": "active"})
    
    # Valid update
    data_service.update_record(db, "account", rec["uid"], {"cs_status": "active"})
    
    # Invalid update
    with pytest.raises(ValueError, match="Invalid value"):
        data_service.update_record(db, "account", rec["uid"], {"cs_status": "wrong"})
