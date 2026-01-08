import yaml
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import text
import glob

from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.core import security
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate
from app.db.session import engine
from app.core.config import settings

def load_yaml(file_path: Path):
    with open(file_path, "r") as f:
        return yaml.safe_load(f)

def process_roles(db: Session, roles_data):
    from app.models.metadata import MetaRole
    for role_data in roles_data:
        if not db.query(MetaRole).filter(MetaRole.name == role_data["name"]).first():
            role = MetaRole(**role_data)
            db.add(role)
    db.commit()

def process_objects(db: Session, objects_data):
    for obj_data in objects_data:
        # Create a copy to avoid modifying the original data
        data = obj_data.copy()
        fields_data = data.pop("fields", [])
        if not meta_service.get_object_by_name(db, data["name"]):
            obj = meta_service.create_object(db, MetaObjectCreate(**data))
            for field_data in fields_data:
                meta_service.create_field(db, obj.id, MetaFieldCreate(**field_data))

def process_records(db: Session, records_data):
    for record_entry in records_data:
        obj_name = record_entry["object"]
        data = record_entry["data"].copy()
        
        # Special handling for password hashing in user object
        if obj_name == "user" and "password" in data:
            data["password"] = security.get_password_hash(data["password"])
            
        try:
            with engine.connect() as conn:
                table_name = f"data_{obj_name}"
                # Check if table exists and is empty
                # Note: meta_service.create_object creates the table
                count = conn.execute(text(f"SELECT count(*) FROM {table_name}")).scalar()
                if count == 0:
                    data_service.create_record(db, obj_name, data)
        except Exception as e:
            print(f"Skipping record seed for {obj_name}: {e}")

def seed_db(db: Session):
    seed_dir = Path(settings.SEED_DIR_PATH)
    
    # Resolve path logic
    if not seed_dir.exists():
        if (Path("..") / seed_dir).exists():
            seed_dir = Path("..") / seed_dir
        else:
            print(f"Seed directory not found at {seed_dir}")
            return

    # 1. Load Metadata (Roles & Objects) from meta.yml
    meta_file = seed_dir / "meta.yml"
    if meta_file.exists():
        print(f"Loading metadata from {meta_file}...")
        meta_data = load_yaml(meta_file)
        if "roles" in meta_data:
            process_roles(db, meta_data["roles"])
        if "objects" in meta_data:
            process_objects(db, meta_data["objects"])
    else:
        print(f"Warning: {meta_file} not found.")

    # 2. Load Records from record-*.yml files
    # We sort the files to ensure deterministic order if needed
    record_files = sorted(list(seed_dir.glob("record-*.yml")))
    for record_file in record_files:
        print(f"Loading records from {record_file.name}...")
        record_data = load_yaml(record_file)
        if record_data and "records" in record_data:
            process_records(db, record_data["records"])
