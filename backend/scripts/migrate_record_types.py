import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.db.session import SessionLocal, engine
from app.services.meta_service import meta_service
from app.services.schema_service import schema_service
from app.models.metadata import MetaObjectRecordType, MetaObject
from app.schemas.metadata import MetaObjectRecordTypeCreate

def migrate():
    db = SessionLocal()
    try:
        # 1. Create meta_object_record_types table if not exists
        # Check if table exists
        with engine.begin() as conn:
            check_stmt = text("SELECT name FROM sqlite_master WHERE type='table' AND name='meta_object_record_types'")
            if not conn.execute(check_stmt).fetchone():
                print("Creating meta_object_record_types table...")
                MetaObjectRecordType.__table__.create(conn)
        
        # 2. Add has_record_type column to meta_objects if not exists
        # SQLite doesn't support IF NOT EXISTS for ADD COLUMN easily, check pragma
        with engine.begin() as conn:
            check_stmt = text("PRAGMA table_info(meta_objects)")
            columns = [row[1] for row in conn.execute(check_stmt).fetchall()]
            if 'has_record_type' not in columns:
                print("Adding has_record_type to meta_objects...")
                conn.execute(text("ALTER TABLE meta_objects ADD COLUMN has_record_type BOOLEAN DEFAULT 0"))

        # 3. Add record_type column to all existing data tables
        objects = meta_service.get_objects(db)
        for obj in objects:
            print(f"Ensuring record_type column for {obj.name}...")
            schema_service.ensure_record_type_column(obj.name)

        # 4. Configure Account object
        account = meta_service.get_object_by_name(db, "account")
        if account:
            print("Configuring Account record types...")
            account.has_record_type = True
            db.add(account)
            db.commit()
            
            # Add options
            existing_rts = {rt.name for rt in account.record_types}
            
            if "professional" not in existing_rts:
                meta_service.add_record_type_option(db, account.id, MetaObjectRecordTypeCreate(
                    name="professional", label="Professional", description="Professional Account", source="system", order=0
                ), allow_system_override=True)
            if "hospital" not in existing_rts:
                meta_service.add_record_type_option(db, account.id, MetaObjectRecordTypeCreate(
                    name="hospital", label="Hospital", description="Hospital Account", source="system", order=1
                ), allow_system_override=True)
            
            # Backfill data if needed (default to professional)
            # Check for records with null record_type
            with engine.begin() as conn:
                update_stmt = text(f"UPDATE data_account SET record_type = 'professional' WHERE record_type IS NULL")
                conn.execute(update_stmt)
            
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
