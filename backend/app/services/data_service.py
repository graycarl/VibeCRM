from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import engine
from app.services.meta_service import meta_service
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone

class DataService:
    def _validate_data(self, db: Session, object_name: str, data: Dict[str, Any], is_create: bool = False):
        obj = meta_service.get_object_by_name(db, object_name)
        if not obj:
            raise ValueError(f"Object {object_name} not found")
        
        # Record Type Validation
        if obj.has_record_type:
            if is_create:
                if "record_type" not in data or not data["record_type"]:
                     raise ValueError("Record type is required.")
                
                # Check valid option
                valid_rts = [rt.name for rt in obj.record_types]
                if data["record_type"] not in valid_rts:
                    raise ValueError(f"Invalid record type '{data['record_type']}'. Valid options are: {', '.join(valid_rts)}")
            else:
                # Update: forbid changing record_type
                if "record_type" in data:
                    # We can either silently drop it or raise error. 
                    # Spec says "immutable". Let's drop it to be safe, or raise if it differs.
                    # Simplest is to remove it from payload so it's not updated.
                    data.pop("record_type", None)

        for field in obj.fields:
            if field.data_type == 'Picklist' and field.name in data:
                val = data[field.name]
                if val is None or val == "":
                    continue
                
                options = field.options or []
                valid_names = [opt['name'] for opt in options]
                if val not in valid_names:
                    raise ValueError(f"Invalid value '{val}' for picklist field '{field.name}'. Valid options are: {', '.join(valid_names)}")

    def create_record(self, db: Session, object_name: str, data: Dict[str, Any], user_id: int = None) -> Dict[str, Any]:
        # Unwrap Pydantic model if passed
        if hasattr(data, 'model_dump'):
             data = data.model_dump(exclude_unset=True)
        
        self._validate_data(db, object_name, data, is_create=True)
        obj = meta_service.get_object_by_name(db, object_name)
        if not obj:
            raise ValueError(f"Object {object_name} not found")
        
        table_name = f"data_{object_name}"
        
        record_uid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # Remove system managed fields from data to prevent override
        data.pop("id", None)
        data.pop("uid", None)
        data.pop("created_at", None)
        data.pop("updated_at", None)
        data.pop("owner_id", None)

        insert_data = {
            "uid": record_uid,
            "created_at": now,
            "updated_at": now,
            "owner_id": user_id,
            **data
        }
        
        columns = ", ".join(insert_data.keys())
        placeholders = ", ".join([f":{k}" for k in insert_data.keys()])
        
        stmt = text(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})")
        
        with engine.begin() as conn:
            conn.execute(stmt, insert_data)
            
        return self.get_record(db, object_name, record_uid)

    def get_record(self, db: Session, object_name: str, record_uid: str) -> Optional[Dict[str, Any]]:
        table_name = f"data_{object_name}"
        stmt = text(f"SELECT * FROM {table_name} WHERE uid = :uid")
        
        with engine.connect() as conn:
            result = conn.execute(stmt, {"uid": record_uid}).mappings().fetchone()
            
        if result:
            return dict(result)
        return None

    def list_records(self, db: Session, object_name: str, skip: int = 0, limit: int = 50, sort_field: str = None, sort_order: str = None) -> Dict[str, Any]:
        # Check object existence first to avoid SQL injection on table name
        obj = meta_service.get_object_by_name(db, object_name)
        if not obj:
            raise ValueError(f"Object {object_name} not found")

        table_name = f"data_{object_name}"
        
        # Count total records
        count_stmt = text(f"SELECT COUNT(*) FROM {table_name}")
        
        # Determine sorting
        order_clause = "created_at DESC"
        
        if sort_field:
            # Security check: verify field exists in metadata
            valid_field = next((f for f in obj.fields if f.name == sort_field), None)
            
            # Allow sorting by system fields if needed, or strictly by defined fields
            # Here we strictly check against metadata fields plus common system fields
            system_fields = ['created_at', 'updated_at', 'id', 'uid']
            
            if valid_field or sort_field in system_fields:
                # Sanitize sort order
                direction = "ASC" if sort_order and sort_order.upper() == "ASC" else "DESC"
                
                # Use quoted identifier to be safe (although we validated existence)
                preparer = engine.dialect.identifier_preparer
                safe_col = preparer.quote(sort_field)
                order_clause = f"{safe_col} {direction}"

        # Fetch data
        stmt = text(f"SELECT * FROM {table_name} ORDER BY {order_clause} LIMIT :limit OFFSET :skip")
        
        with engine.connect() as conn:
            total = conn.execute(count_stmt).scalar()
            result = conn.execute(stmt, {"limit": limit, "skip": skip}).mappings().all()
            
        return {
            "items": [dict(row) for row in result],
            "total": total
        }

    def update_record(self, db: Session, object_name: str, record_uid: str, data: Dict[str, Any]) -> Dict[str, Any]:
        # Unwrap Pydantic model if passed
        if hasattr(data, 'model_dump'):
             data = data.model_dump(exclude_unset=True)

        self._validate_data(db, object_name, data, is_create=False)
        table_name = f"data_{object_name}"
        
        # Remove protected fields
        data.pop("id", None)
        data.pop("uid", None)
        data.pop("created_at", None)
        data.pop("updated_at", None)
        
        if not data:
            return self.get_record(db, object_name, record_uid)

        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        set_clauses = ", ".join([f"{k} = :{k}" for k in data.keys()])
        stmt = text(f"UPDATE {table_name} SET {set_clauses} WHERE uid = :uid")
        
        with engine.begin() as conn:
            conn.execute(stmt, {**data, "uid": record_uid})
            
        return self.get_record(db, object_name, record_uid)

    def delete_record(self, db: Session, object_name: str, record_uid: str) -> bool:
        table_name = f"data_{object_name}"
        stmt = text(f"DELETE FROM {table_name} WHERE uid = :uid")
        
        with engine.begin() as conn:
            result = conn.execute(stmt, {"uid": record_uid})
            return result.rowcount > 0

    def migrate_picklist_values(self, db: Session, field_id: str, old_value: str, new_value: Optional[str]):
        field = meta_service.get_field(db, field_id)
        if not field:
            raise ValueError("Field not found")
        
        obj = meta_service.get_object(db, field.object_id)
        table_name = f"data_{obj.name}"
        column_name = field.name
        
        # Safely quote identifiers to prevent SQL injection
        preparer = engine.dialect.identifier_preparer
        safe_table_name = preparer.quote(table_name)
        safe_column_name = preparer.quote(column_name)

        stmt = text(f"UPDATE {safe_table_name} SET {safe_column_name} = :new_value WHERE {safe_column_name} = :old_value")
        with engine.begin() as conn:
            conn.execute(stmt, {"new_value": new_value, "old_value": old_value})

data_service = DataService()
