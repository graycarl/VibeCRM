import pytest
from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate

def test_metadata_field_lifecycle(db):
    db_session = db
    
    # 1. Create a Source Object
    obj = meta_service.create_object(db_session, MetaObjectCreate(
        name="cs_meta_test",
        label="Metadata Test Object"
    ))
    
    # 2. Create Metadata Field
    # Case 2a: Missing metadata_name
    with pytest.raises(ValueError, match="metadata_name specified"):
        meta_service.create_field(db_session, obj.id, MetaFieldCreate(
            name="cs_meta_ref",
            label="Meta Ref",
            data_type="Metadata"
        ))
        
    # Case 2b: Success
    # We use a dummy metadata_name for now as our validation is global
    field = meta_service.create_field(db_session, obj.id, MetaFieldCreate(
        name="cs_meta_ref",
        label="Meta Ref",
        data_type="Metadata",
        metadata_name="MetaObject" 
    ))
    
    # 3. Create Data Record referencing Metadata (Object)
    # We reference the Object 'cs_meta_test' itself
    data = {
        "cs_meta_ref": "cs_meta_test"
    }
    record = data_service.create_record(db_session, "cs_meta_test", data)
    
    assert record["cs_meta_ref"] == "cs_meta_test"
    # Verify Enrichment
    assert record["cs_meta_ref__label"] == "Metadata Test Object"
    
    # 4. Reference a Field
    # Add a field to the object
    fld = meta_service.create_field(db_session, obj.id, MetaFieldCreate(
        name="cs_some_field",
        label="Some Field",
        data_type="Text"
    ))
    
    data_field_ref = {
        "cs_meta_ref": "cs_meta_test.cs_some_field"
    }
    record_fld = data_service.create_record(db_session, "cs_meta_test", data_field_ref)
    
    assert record_fld["cs_meta_ref"] == "cs_meta_test.cs_some_field"
    assert record_fld["cs_meta_ref__label"] == "Metadata Test Object.Some Field"
    
    # 5. Validation Error
    with pytest.raises(ValueError, match="Invalid metadata reference"):
        data_service.create_record(db_session, "cs_meta_test", {
            "cs_meta_ref": "cs_non_existent"
        })

    # 6. Deleted Metadata Fallback
    # Create a separate target object to delete
    target = meta_service.create_object(db_session, MetaObjectCreate(name="cs_target", label="Target"))
    
    rec_del = data_service.create_record(db_session, "cs_meta_test", {
        "cs_meta_ref": "cs_target"
    })
    assert rec_del["cs_meta_ref__label"] == "Target"
    
    # Delete target
    meta_service.delete_object(db_session, target.id)
    
    # Fetch record again
    fetched = data_service.get_record(db_session, "cs_meta_test", rec_del["uid"])
    assert fetched["cs_meta_ref"] == "cs_target"
    assert fetched["cs_meta_ref__label"] == "已删除"
