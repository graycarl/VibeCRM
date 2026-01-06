from app.db.session import engine
from app.models.metadata import Base
from app.core.config import settings

def init_db():
    print(f"Creating metadata tables in {settings.DATABASE_URL}...")
    Base.metadata.create_all(bind=engine)
    print("Metadata tables created.")

if __name__ == "__main__":
    init_db()
