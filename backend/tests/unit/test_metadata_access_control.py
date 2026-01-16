import pytest
from sqlalchemy.orm import Session
from app.services.meta_service import MetaService
from app.schemas.metadata import MetaObjectCreate, MetaObjectUpdate, MetaFieldCreate
from app.models.metadata import MetaObject, MetaField

meta_service = MetaService()


class TestMetadataAccessControl:
    """Test access control rules for system vs custom metadata."""

    @pytest.fixture
    def system_object(self, db: Session):
        """Create a system object for testing."""
        # Use a unique name to avoid conflicts
        import uuid
        obj = MetaObject(
            name=f"TestSystemObj_{uuid.uuid4().hex[:8]}",
            label="Test System Object",
            description="System Test Object",
            source="system"
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        yield obj
        # Cleanup
        db.delete(obj)
        db.commit()

    @pytest.fixture
    def custom_object(self, db: Session):
        """Create a custom object for testing."""
        import uuid
        obj = MetaObject(
            name=f"cs_test_obj_{uuid.uuid4().hex[:8]}",
            label="Test Custom Object",
            description="Custom Test Description",
            source="custom"
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        yield obj
        # Cleanup
        db.delete(obj)
        db.commit()

    @pytest.fixture
    def system_field(self, db: Session, system_object: MetaObject):
        """Create a system field for testing."""
        import uuid
        field = MetaField(
            object_id=system_object.id,
            name=f"test_sys_field_{uuid.uuid4().hex[:8]}",
            label="Test System Field",
            description="System Field Description",
            data_type="Text",
            is_required=True,
            source="system"
        )
        db.add(field)
        db.commit()
        db.refresh(field)
        yield field
        # Cleanup
        db.delete(field)
        db.commit()

    @pytest.fixture
    def custom_field(self, db: Session, custom_object: MetaObject):
        """Create a custom field for testing."""
        import uuid
        field = MetaField(
            object_id=custom_object.id,
            name=f"cs_test_field_{uuid.uuid4().hex[:8]}",
            label="Test Custom Field",
            description="Custom Field Description",
            data_type="Text",
            is_required=False,
            source="custom"
        )
        db.add(field)
        db.commit()
        db.refresh(field)
        yield field
        # Cleanup
        db.delete(field)
        db.commit()

    def test_system_object_can_update_label(self, db: Session, system_object: MetaObject):
        """System objects should allow label updates."""
        update_data = MetaObjectUpdate(label="New Label")
        updated = meta_service.update_object(db, system_object.id, update_data)
        assert updated.label == "New Label"
        assert updated.description == "System Test Object"  # unchanged

    def test_system_object_cannot_update_description(self, db: Session, system_object: MetaObject):
        """System objects should not allow description updates."""
        update_data = MetaObjectUpdate(description="New Description")
        with pytest.raises(ValueError, match="Cannot modify description of a system object"):
            meta_service.update_object(db, system_object.id, update_data)

    def test_custom_object_can_update_all(self, db: Session, custom_object: MetaObject):
        """Custom objects should allow updating label and description."""
        update_data = MetaObjectUpdate(label="New Label", description="New Description")
        updated = meta_service.update_object(db, custom_object.id, update_data)
        assert updated.label == "New Label"
        assert updated.description == "New Description"

    def test_system_field_can_update_label(self, db: Session, system_field: MetaField):
        """System fields should allow label updates."""
        updated = meta_service.update_field(db, system_field.id, label="New Label")
        assert updated.label == "New Label"
        assert updated.is_required == True  # unchanged
        assert updated.description == "System Field Description"  # unchanged

    def test_system_field_cannot_update_required(self, db: Session, system_field: MetaField):
        """System fields should not allow is_required updates."""
        with pytest.raises(ValueError, match="Cannot modify 'is_required' of a system field"):
            meta_service.update_field(db, system_field.id, is_required=False)

    def test_system_field_cannot_update_description(self, db: Session, system_field: MetaField):
        """System fields should not allow description updates."""
        with pytest.raises(ValueError, match="Cannot modify 'description' of a system field"):
            meta_service.update_field(db, system_field.id, description="New Description")

    def test_custom_field_can_update_all(self, db: Session, custom_field: MetaField):
        """Custom fields should allow updating label, is_required, and description."""
        updated = meta_service.update_field(
            db, 
            custom_field.id, 
            label="New Label",
            is_required=True,
            description="New Description"
        )
        assert updated.label == "New Label"
        assert updated.is_required == True
        assert updated.description == "New Description"

    def test_system_field_picklist_options_locked(self, db: Session, system_object: MetaObject):
        """System picklist fields should not allow option modifications."""
        # Create a system picklist field
        field = MetaField(
            object_id=system_object.id,
            name="status",
            label="Status",
            data_type="Picklist",
            options=[{"name": "active", "label": "Active"}],
            is_required=False,
            source="system"
        )
        db.add(field)
        db.commit()
        db.refresh(field)

        # Try to add an option
        with pytest.raises(ValueError, match="Cannot modify options of a system field"):
            meta_service.add_option(db, field.id, "inactive", "Inactive")

        # Try to update an option
        with pytest.raises(ValueError, match="Cannot modify options of a system field"):
            meta_service.update_option(db, field.id, "active", "Active Updated")

        # Try to delete an option
        with pytest.raises(ValueError, match="Cannot modify options of a system field"):
            meta_service.delete_option(db, field.id, "active")

        # Try to reorder options
        with pytest.raises(ValueError, match="Cannot modify options of a system field"):
            meta_service.reorder_options(db, field.id, ["active"])
