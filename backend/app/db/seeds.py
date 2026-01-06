from sqlalchemy.orm import Session
from app.services.meta_service import meta_service
from app.services.data_service import data_service
from app.core import security
from app.schemas.metadata import MetaObjectCreate, MetaFieldCreate
from app.db.session import engine
from sqlalchemy import text

def seed_db(db: Session):
    # 1. Seed Roles
    from app.models.metadata import MetaRole
    if not db.query(MetaRole).filter(MetaRole.name == "admin").first():
        admin_role = MetaRole(name="admin", label="Administrator", source="system")
        db.add(admin_role)
        db.commit()

    # 2. Seed User Object
    if not meta_service.get_object_by_name(db, "user"):
        user_obj = meta_service.create_object(db, MetaObjectCreate(
            name="user", label="User", description="System User", source="system"
        ))
        
        # Add fields
        meta_service.create_field(db, user_obj.id, MetaFieldCreate(
            name="name", label="Full Name", data_type="Text", source="system"
        ))
        meta_service.create_field(db, user_obj.id, MetaFieldCreate(
            name="email", label="Email", data_type="Text", is_required=True, source="system"
        ))
        meta_service.create_field(db, user_obj.id, MetaFieldCreate(
            name="password", label="Password Hash", data_type="Text", source="system"
        ))
        meta_service.create_field(db, user_obj.id, MetaFieldCreate(
            name="role", label="Role", data_type="Text", source="system"
        ))

    # 3. Seed Default Admin User in data_user
    try:
        with engine.connect() as conn:
            # We use mappings() to be safe with column access
            count = conn.execute(text("SELECT count(*) FROM data_user")).scalar()
            if count == 0:
                data_service.create_record(db, "user", {
                    "name": "Admin User",
                    "email": "admin@vibecrm.com",
                    "password": security.get_password_hash("admin123"),
                    "role": "admin"
                })
    except Exception as e:
        # data_user might not exist yet if meta_service.create_object failed
        print(f"Skipping user data seed: {e}")
