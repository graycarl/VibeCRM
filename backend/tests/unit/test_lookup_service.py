import pytest
from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate, MetaObjectUpdate

def test_lookup_field_lifecycle(db):
    db_session = db
    # 1. Create Target Object (e.g., 'Department')
    dept_obj = meta_service.create_object(db_session, MetaObjectCreate(
        name="cs_department",
        label="Department",
        description="Target object for lookup"
    ))
    
    # Add a name field to Department (e.g., 'dept_name')
    meta_service.create_field(db_session, dept_obj.id, MetaFieldCreate(
        name="cs_dept_name",
        label="Department Name",
        data_type="Text",
        is_required=True
    ))

    # Set 'dept_name' as the name_field for Department
    meta_service.update_object(db_session, dept_obj.id, MetaObjectUpdate(
        name_field="cs_dept_name"
    ))

    # Create a record in Department
    dept_record = data_service.create_record(db_session, "cs_department", {
        "cs_dept_name": "Engineering"
    })
    
    assert dept_record["cs_dept_name"] == "Engineering"
    dept_id = dept_record["id"]

    # 2. Create Source Object (e.g., 'Employee')
    emp_obj = meta_service.create_object(db_session, MetaObjectCreate(
        name="cs_employee",
        label="Employee"
    ))

    # Add Lookup Field to Employee pointing to Department
    # Case 2a: Try to create lookup without lookup_object (Should Fail)
    with pytest.raises(ValueError, match="lookup_object specified"):
        meta_service.create_field(db_session, emp_obj.id, MetaFieldCreate(
            name="cs_dept_ref",
            label="Department Ref",
            data_type="Lookup"
        ))
    
    # Case 2b: Try to create lookup to non-existent object (Should Fail)
    with pytest.raises(ValueError, match="not found"):
        meta_service.create_field(db_session, emp_obj.id, MetaFieldCreate(
            name="cs_dept_ref",
            label="Department Ref",
            data_type="Lookup",
            lookup_object="cs_non_existent"
        ))

    # Case 2c: Correct Creation
    lookup_field = meta_service.create_field(db_session, emp_obj.id, MetaFieldCreate(
        name="cs_dept_ref",
        label="Department Ref",
        data_type="Lookup",
        lookup_object="cs_department"
    ))
    
    assert lookup_field.lookup_object == "cs_department"

    # 3. Data Operations with Lookup
    
    # Case 3a: Create Employee with valid lookup ID
    emp_data = {
        "cs_dept_ref": dept_id
    }
    emp_record = data_service.create_record(db_session, "cs_employee", emp_data)
    
    # Verify storage (ID)
    assert emp_record["cs_dept_ref"] == dept_id
    # Verify enrichment (Label) - DataService.create_record returns get_record which enriches
    assert emp_record["cs_dept_ref__label"] == "Engineering"

    # Case 3b: Create Employee with INVALID lookup ID (Should Fail)
    with pytest.raises(ValueError, match="Referenced record 99999 not found"):
        data_service.create_record(db_session, "cs_employee", {
            "cs_dept_ref": 99999
        })

    # Case 3c: List records enrichment
    list_result = data_service.list_records(db_session, "cs_employee")
    item = list_result["items"][0]
    assert item["cs_dept_ref"] == dept_id
    assert item["cs_dept_ref__label"] == "Engineering"

    # Case 3d: Update record
    # Create another department
    dept2_record = data_service.create_record(db_session, "cs_department", {
        "cs_dept_name": "Sales"
    })
    
    updated_emp = data_service.update_record(db_session, "cs_employee", emp_record["uid"], {
        "cs_dept_ref": dept2_record["id"]
    })
    
    assert updated_emp["cs_dept_ref"] == dept2_record["id"]
    assert updated_emp["cs_dept_ref__label"] == "Sales"

    # Case 3e: Fallback when name_field is not set (or cleared)
    # Unset name_field on Department
    # Note: Pydantic Update model fields are optional, but passing None might be filtered out by exclude_unset=True if not careful.
    # MetaService.update_object handles logic manually.
    # We didn't implement explicit "unset" in update_object logic for name_field if passed as None?
    # Let's check logic: if obj_in.name_field is not None... 
    # So we can't easily unset it via current update_object logic unless we allow empty string or similar.
    # For test purpose, let's create a NEW object without name_field to test fallback.
    
    meta_service.create_object(db_session, MetaObjectCreate(
        name="cs_silent",
        label="Silent"
    ))
    silent_record = data_service.create_record(db_session, "cs_silent", {})
    
    # Add lookup to silent object on Employee
    meta_service.create_field(db_session, emp_obj.id, MetaFieldCreate(
        name="cs_silent_ref",
        label="Silent Ref",
        data_type="Lookup",
        lookup_object="cs_silent"
    ))
    
    emp_w_silent = data_service.create_record(db_session, "cs_employee", {
        "cs_silent_ref": silent_record["id"]
    })
    
    # Should fallback to UID since name_field is None
    assert emp_w_silent["cs_silent_ref__label"] == silent_record["uid"]
