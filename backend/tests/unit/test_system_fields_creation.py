import pytest
import uuid
from sqlalchemy.orm import Session
from app.services.meta_service import MetaService
from app.schemas.metadata import MetaObjectCreate
from app.models.metadata import MetaObject, MetaField
from app.services.schema_service import schema_service

meta_service = MetaService()


class TestSystemFieldsAutoCreation:
    """Test automatic creation of system fields metadata when creating objects."""

    def test_system_fields_created_automatically(self, db: Session):
        """Test that system fields are automatically created when a new object is created."""
        # Create a new custom object with unique name
        obj_in = MetaObjectCreate(
            name=f"cs_test_auto_fields_{uuid.uuid4().hex[:8]}",
            label="Test Auto Fields",
            description="Test automatic system fields creation",
            source="custom",
            has_record_type=False
        )
        
        db_obj = meta_service.create_object(db, obj_in)
        
        # Query all fields for this object
        fields = db.query(MetaField).filter(MetaField.object_id == db_obj.id).all()
        field_names = [f.name for f in fields]
        
        # Verify all required system fields are present
        assert "uid" in field_names, "uid field should be created automatically"
        assert "created_on" in field_names, "created_on field should be created automatically"
        assert "modified_on" in field_names, "modified_on field should be created automatically"
        assert "owner_id" in field_names, "owner_id field should be created automatically"
        
        # Verify record_type is NOT created when has_record_type=False
        assert "record_type" not in field_names, "record_type should not be created when has_record_type=False"
        
        # Cleanup
        try:
            schema_service.drop_object_table(db_obj.name)
        except Exception:
            pass
        db.query(MetaField).filter(MetaField.object_id == db_obj.id).delete()
        db.delete(db_obj)
        db.commit()

    def test_system_fields_have_correct_attributes(self, db: Session):
        """Test that system fields have correct attributes (source='system', correct data_types, etc.)."""
        # Create a new custom object with unique name
        obj_in = MetaObjectCreate(
            name=f"cs_test_field_attrs_{uuid.uuid4().hex[:8]}",
            label="Test Field Attributes",
            description="Test system field attributes",
            source="custom",
            has_record_type=False
        )
        
        db_obj = meta_service.create_object(db, obj_in)
        
        # Query all fields for this object
        fields = db.query(MetaField).filter(MetaField.object_id == db_obj.id).all()
        fields_dict = {f.name: f for f in fields}
        
        # Test uid field
        uid_field = fields_dict.get("uid")
        assert uid_field is not None, "uid field should exist"
        assert uid_field.source == "system", "uid should have source='system'"
        assert uid_field.data_type == "Text", "uid should have data_type='Text'"
        assert uid_field.is_required == True, "uid should be required"
        assert uid_field.label == "UID", "uid should have correct label"
        
        # Test created_on field
        created_on_field = fields_dict.get("created_on")
        assert created_on_field is not None, "created_on field should exist"
        assert created_on_field.source == "system", "created_on should have source='system'"
        assert created_on_field.data_type == "Datetime", "created_on should have data_type='Datetime'"
        assert created_on_field.is_required == True, "created_on should be required"
        assert created_on_field.label == "Created On", "created_on should have correct label"
        
        # Test modified_on field
        modified_on_field = fields_dict.get("modified_on")
        assert modified_on_field is not None, "modified_on field should exist"
        assert modified_on_field.source == "system", "modified_on should have source='system'"
        assert modified_on_field.data_type == "Datetime", "modified_on should have data_type='Datetime'"
        assert modified_on_field.is_required == True, "modified_on should be required"
        assert modified_on_field.label == "Modified On", "modified_on should have correct label"
        
        # Test owner_id field
        owner_id_field = fields_dict.get("owner_id")
        assert owner_id_field is not None, "owner_id field should exist"
        assert owner_id_field.source == "system", "owner_id should have source='system'"
        assert owner_id_field.data_type == "Lookup", "owner_id should have data_type='Lookup'"
        assert owner_id_field.is_required == True, "owner_id should be required"
        assert owner_id_field.label == "Owner", "owner_id should have correct label"
        # Verify lookup config
        assert owner_id_field.lookup_object == "user", "owner_id should reference user object"
        assert owner_id_field.options is None, "owner_id should not have options"
        
        # Cleanup
        try:
            schema_service.drop_object_table(db_obj.name)
        except Exception:
            pass
        db.query(MetaField).filter(MetaField.object_id == db_obj.id).delete()
        db.delete(db_obj)
        db.commit()

    def test_record_type_field_created_when_enabled(self, db: Session):
        """Test that record_type field is created when has_record_type=True."""
        # Create a new custom object with record type enabled and unique name
        obj_in = MetaObjectCreate(
            name=f"cs_test_record_type_{uuid.uuid4().hex[:8]}",
            label="Test Record Type",
            description="Test record_type field creation",
            source="custom",
            has_record_type=True
        )
        
        db_obj = meta_service.create_object(db, obj_in)
        
        # Query all fields for this object
        fields = db.query(MetaField).filter(MetaField.object_id == db_obj.id).all()
        field_names = [f.name for f in fields]
        
        # Verify record_type field is present
        assert "record_type" in field_names, "record_type field should be created when has_record_type=True"
        
        # Get the record_type field and verify its attributes
        fields_dict = {f.name: f for f in fields}
        record_type_field = fields_dict.get("record_type")
        
        assert record_type_field is not None, "record_type field should exist"
        assert record_type_field.source == "system", "record_type should have source='system'"
        assert record_type_field.data_type == "Text", "record_type should have data_type='Text'"
        assert record_type_field.is_required == False, "record_type should not be required"
        assert record_type_field.label == "Record Type", "record_type should have correct label"
        
        # Cleanup
        try:
            schema_service.drop_object_table(db_obj.name)
        except Exception:
            pass
        db.query(MetaField).filter(MetaField.object_id == db_obj.id).delete()
        db.delete(db_obj)
        db.commit()

    def test_record_type_field_not_created_when_disabled(self, db: Session):
        """Test that record_type field is NOT created when has_record_type=False."""
        # Create a new custom object with record type disabled and unique name
        obj_in = MetaObjectCreate(
            name=f"cs_test_no_record_type_{uuid.uuid4().hex[:8]}",
            label="Test No Record Type",
            description="Test record_type field is not created",
            source="custom",
            has_record_type=False
        )
        
        db_obj = meta_service.create_object(db, obj_in)
        
        # Query all fields for this object
        fields = db.query(MetaField).filter(MetaField.object_id == db_obj.id).all()
        field_names = [f.name for f in fields]
        
        # Verify record_type field is NOT present
        assert "record_type" not in field_names, "record_type field should NOT be created when has_record_type=False"
        
        # Verify only the 4 core system fields are present
        assert len(fields) == 4, "Should have exactly 4 system fields (uid, created_on, modified_on, owner_id)"
        
        # Cleanup
        try:
            schema_service.drop_object_table(db_obj.name)
        except Exception:
            pass
        db.query(MetaField).filter(MetaField.object_id == db_obj.id).delete()
        db.delete(db_obj)
        db.commit()

    def test_system_fields_count(self, db: Session):
        """Test that the correct number of system fields are created."""
        # Test without record_type
        obj_in_no_rt = MetaObjectCreate(
            name=f"cs_test_count_no_rt_{uuid.uuid4().hex[:8]}",
            label="Test Count No RT",
            description="Test field count without record type",
            source="custom",
            has_record_type=False
        )
        
        db_obj_no_rt = meta_service.create_object(db, obj_in_no_rt)
        fields_no_rt = db.query(MetaField).filter(MetaField.object_id == db_obj_no_rt.id).all()
        
        assert len(fields_no_rt) == 4, "Should have 4 system fields without record_type"
        
        # Test with record_type
        obj_in_with_rt = MetaObjectCreate(
            name=f"cs_test_count_with_rt_{uuid.uuid4().hex[:8]}",
            label="Test Count With RT",
            description="Test field count with record type",
            source="custom",
            has_record_type=True
        )
        
        db_obj_with_rt = meta_service.create_object(db, obj_in_with_rt)
        fields_with_rt = db.query(MetaField).filter(MetaField.object_id == db_obj_with_rt.id).all()
        
        assert len(fields_with_rt) == 5, "Should have 5 system fields with record_type"
        
        # Cleanup
        try:
            schema_service.drop_object_table(db_obj_no_rt.name)
        except Exception:
            pass
        try:
            schema_service.drop_object_table(db_obj_with_rt.name)
        except Exception:
            pass
        db.query(MetaField).filter(MetaField.object_id == db_obj_no_rt.id).delete()
        db.delete(db_obj_no_rt)
        db.query(MetaField).filter(MetaField.object_id == db_obj_with_rt.id).delete()
        db.delete(db_obj_with_rt)
        db.commit()
