from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import engine
from app.services.meta_service import meta_service
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class DataService:
    def create_record(self, db: Session, object_name: str, data: Dict[str, Any], user_id: int = None) -> Dict[str, Any]:
        obj = meta_service.get_object_by_name(db, object_name)
        if not obj:
            raise ValueError(f"Object {object_name} not found")
        
        table_name = f"data_{object_name}"
        
        record_uid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
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

    def list_records(self, db: Session, object_name: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        # Check object existence first to avoid SQL injection on table name
        obj = meta_service.get_object_by_name(db, object_name)
        if not obj:
            raise ValueError(f"Object {object_name} not found")

        table_name = f"data_{object_name}"
        stmt = text(f"SELECT * FROM {table_name} LIMIT :limit OFFSET :skip")
        
        with engine.connect() as conn:
            result = conn.execute(stmt, {"limit": limit, "skip": skip}).mappings().all()
            
        return [dict(row) for row in result]

    def update_record(self, db: Session, object_name: str, record_uid: str, data: Dict[str, Any]) -> Dict[str, Any]:
        table_name = f"data_{object_name}"
        
        if not data:
            return self.get_record(db, object_name, record_uid)

        data["updated_at"] = datetime.utcnow().isoformat()
        
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

data_service = DataService()
