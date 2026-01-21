import pytest
from app.services.meta_service import meta_service as MetaService
from app.services.data_service import data_service as DataService
from app.schemas.metadata import MetaObjectCreate, MetaObjectRecordTypeCreate, MetaObjectUpdate
from app.schemas.dynamic import RecordCreate, RecordUpdate

def test_custom_object_record_type_lifecycle(db):
    # 1. Create Object with has_record_type=True
    obj_data = MetaObjectCreate(
        name="cs_project",
        label="Project",
        description="Project management",
        source="custom",
        has_record_type=True
    )
    meta_obj = MetaService.create_object(db, obj_data)
    assert meta_obj.has_record_type is True
    assert len(meta_obj.record_types) == 0

    # 2. Add Record Types
    rt1_data = MetaObjectRecordTypeCreate(name="internal", label="Internal Project")
    rt1 = MetaService.add_record_type_option(db, meta_obj.id, rt1_data)
    assert rt1.name == "internal"
    assert rt1.order == 1

    rt2_data = MetaObjectRecordTypeCreate(name="external", label="External Project")
    rt2 = MetaService.add_record_type_option(db, meta_obj.id, rt2_data)
    assert rt2.name == "external"
    assert rt2.order == 2

    # 3. Create Data Record with Record Type
    
    from app.schemas.metadata import MetaFieldCreate
    name_field = MetaFieldCreate(
        name="cs_name",
        label="Project Name",
        data_type="Text",
        is_required=True,
        source="custom"
    )
    MetaService.create_field(db, meta_obj.id, name_field)

    data_payload = {"cs_name": "Proj A", "record_type": "internal"}
    record = DataService.create_record(db, meta_obj.name, RecordCreate(**data_payload))
    assert record["record_type"] == "internal"

    # 4. Validate Invalid Record Type
    bad_payload = {"cs_name": "Proj B", "record_type": "invalid_type"}
    with pytest.raises(ValueError) as exc:
        DataService.create_record(db, meta_obj.name, RecordCreate(**bad_payload))
    assert "Invalid record type" in str(exc.value)

    # 5. Immutable Record Type on Update
    update_payload = {"record_type": "external"}
    with pytest.raises(ValueError):
        DataService.update_record(db, meta_obj.name, record["uid"], RecordUpdate(**update_payload))

    # 6. Delete Record Type
    # Should fail if used
    with pytest.raises(ValueError) as exc:
        MetaService.delete_record_type_option(db, rt1.id)
    assert "used by" in str(exc.value)

    # Delete unused one
    MetaService.delete_record_type_option(db, rt2.id)
    updated_obj = MetaService.get_object(db, meta_obj.id)
    assert len(updated_obj.record_types) == 1

def test_system_object_record_type_protection(db):
    # 1. Create System Object (simulated)
    # Usually created via migration, but we can simulate via service if not restricted at creation time
    # Service allows source='system' if not checking user context, but let's assume we use source='custom' for testing 
    # or create a system one directly if allowed. 
    # MetaService.create_object allows specifying source.
    
    obj_data = MetaObjectCreate(
        name="sys_ticket",
        label="Ticket",
        source="system",
        has_record_type=False
    )
    meta_obj = MetaService.create_object(db, obj_data)
    
    # 2. Try to enable record type (should fail for system object without override)
    with pytest.raises(ValueError) as exc:
        MetaService.update_object(db, meta_obj.id, MetaObjectUpdate(has_record_type=True))
    assert "Cannot change 'has_record_type' for system objects" in str(exc.value)
    
    # 3. Enable via override (simulating migration script)
    updated_obj = MetaService.update_object(db, meta_obj.id, MetaObjectUpdate(has_record_type=True), allow_system_override=True)
    assert updated_obj.has_record_type is True

    # 4. Add Record Type
    rt_data = MetaObjectRecordTypeCreate(name="bug", label="Bug Report")
    MetaService.add_record_type_option(db, meta_obj.id, rt_data, allow_system_override=True)
    
    rt_custom_data = MetaObjectRecordTypeCreate(name="feature", label="Feature Request")
    with pytest.raises(ValueError) as exc:
        MetaService.add_record_type_option(db, meta_obj.id, rt_custom_data)
    assert "Cannot add record types to system objects" in str(exc.value)

