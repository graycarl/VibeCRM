import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.main import app
from app.api.deps import get_db

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from unittest.mock import patch

@pytest.fixture(scope="module", autouse=True)
def mock_engines():
    with patch("app.services.schema_service.engine", test_engine), \
         patch("app.services.data_service.engine", test_engine), \
         patch("app.db.seeds.engine", test_engine), \
         patch("app.services.auth_service.engine", test_engine):
        yield

from app.db.seeds import seed_db

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    # Seed the test DB
    seed_db(db)
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="module")
def client(db):
    # Dependency override
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
