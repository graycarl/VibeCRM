from sqlalchemy.orm import Session
from app.models.metadata import MetaObject, MetaField, MetaRole
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate, MetaRoleCreate, MetaRoleUpdate
from app.services.schema_service import schema_service
import uuid

class MetaService:
    def create_object(self, db: Session, obj_in: MetaObjectCreate) -> MetaObject:
        # Check if name exists
        existing = db.query(MetaObject).filter(MetaObject.name == obj_in.name).first()
        if existing:
            raise ValueError(f"Object with name '{obj_in.name}' already exists.")

        db_obj = MetaObject(
            name=obj_in.name,
            label=obj_in.label,
            description=obj_in.description,
            source=obj_in.source
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Create physical table
        try:
            schema_service.create_object_table(db_obj.name)
        except Exception as e:
            # Rollback metadata if DDL fails
            db.delete(db_obj)
            db.commit()
            raise e
        
        return db_obj

    def get_objects(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(MetaObject).offset(skip).limit(limit).all()

    def get_object(self, db: Session, object_id: str):
        return db.query(MetaObject).filter(MetaObject.id == object_id).first()
        
    def get_object_by_name(self, db: Session, name: str):
        return db.query(MetaObject).filter(MetaObject.name == name).first()

    def create_field(self, db: Session, object_id: str, field_in: MetaFieldCreate) -> MetaField:
        # Get object to check existence and name
        obj = self.get_object(db, object_id)
        if not obj:
            raise ValueError("Object not found")
            
        db_field = MetaField(
            object_id=object_id,
            name=field_in.name,
            label=field_in.label,
            data_type=field_in.data_type,
            options=field_in.options,
            is_required=field_in.is_required,
            source=field_in.source
        )
        db.add(db_field)
        db.commit()
        db.refresh(db_field)
        
        # Add column to physical table
        try:
            schema_service.add_column(obj.name, db_field.name, db_field.data_type)
        except Exception as e:
            # Rollback metadata if DDL fails
            db.delete(db_field)
            db.commit()
            raise e
        
        return db_field
        
    def delete_object(self, db: Session, object_id: str):
        obj = self.get_object(db, object_id)
        if obj:
            # Drop physical table first
            schema_service.delete_object_table(obj.name)
            db.delete(obj)
            db.commit()
            return True
        return False

    # Role Methods
    def create_role(self, db: Session, role_in: MetaRoleCreate) -> MetaRole:
        existing = db.query(MetaRole).filter(MetaRole.name == role_in.name).first()
        if existing:
            raise ValueError(f"Role with name '{role_in.name}' already exists.")
            
        db_role = MetaRole(
            name=role_in.name,
            label=role_in.label,
            description=role_in.description,
            permissions=role_in.permissions,
            source=role_in.source
        )
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role

    def get_roles(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(MetaRole).offset(skip).limit(limit).all()

    def get_role(self, db: Session, role_id: str):
        return db.query(MetaRole).filter(MetaRole.id == role_id).first()

    def update_role(self, db: Session, role_id: str, role_in: MetaRoleUpdate) -> MetaRole:
        db_role = self.get_role(db, role_id)
        if not db_role:
            return None
        
        update_data = role_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_role, field, value)
            
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role

    def delete_role(self, db: Session, role_id: str) -> bool:
        db_role = self.get_role(db, role_id)
        if not db_role:
            return False
            
        if db_role.source == "system":
            raise ValueError("Cannot delete system role")
            
        db.delete(db_role)
        db.commit()
        return True

meta_service = MetaService()