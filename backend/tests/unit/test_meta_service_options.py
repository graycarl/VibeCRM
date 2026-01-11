import pytest
from app.services.meta_service import meta_service
from app.models.metadata import MetaObject
from app.schemas.metadata import MetaFieldCreate

def test_add_option(db):
    # 1. Create a picklist field
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="test_picklist",
        label="Test Picklist",
        data_type="Picklist",
        options=[]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    # 2. Add an option
    meta_service.add_option(db, field.id, "option1", "Option 1")
    
    # 3. Verify
    db.refresh(field)
    assert len(field.options) == 1
    assert field.options[0]["name"] == "option1"
    assert field.options[0]["label"] == "Option 1"

def test_add_duplicate_option(db):
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="test_picklist_dup",
        label="Test Picklist Dup",
        data_type="Picklist",
        options=[{"name": "opt1", "label": "Opt 1"}]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    with pytest.raises(ValueError, match="already exists"):
        meta_service.add_option(db, field.id, "opt1", "New Label")

def test_update_option(db):
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="test_picklist_update",
        label="Test Picklist Update",
        data_type="Picklist",
        options=[{"name": "opt1", "label": "Old Label"}]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    meta_service.update_option(db, field.id, "opt1", "New Label")
    
    db.refresh(field)
    assert field.options[0]["label"] == "New Label"

def test_delete_option(db):
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="test_picklist_delete",
        label="Test Picklist Delete",
        data_type="Picklist",
        options=[{"name": "opt1", "label": "Opt 1"}]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    meta_service.delete_option(db, field.id, "opt1")
    
    db.refresh(field)
    assert len(field.options) == 0

def test_invalid_option_name(db):
    obj = meta_service.get_object_by_name(db, "account")
    field_in = MetaFieldCreate(
        name="test_picklist_invalid",
        label="Test Picklist Invalid",
        data_type="Picklist",
        options=[]
    )
    field = meta_service.create_field(db, obj.id, field_in)
    
    # Test invalid names (FR-012)
    with pytest.raises(ValueError, match="Option name must be"):
        meta_service.add_option(db, field.id, "1invalid", "Label")
    
    with pytest.raises(ValueError, match="Option name must be"):
        meta_service.add_option(db, field.id, "Invalid", "Label")
    
    with pytest.raises(ValueError, match="Option name must be"):
        meta_service.add_option(db, field.id, "invalid-name", "Label")
