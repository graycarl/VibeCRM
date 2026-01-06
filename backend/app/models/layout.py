import uuid
from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class MetaPageLayout(Base):
    __tablename__ = "meta_page_layouts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    object_id: Mapped[str] = mapped_column(String(36), ForeignKey("meta_objects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=True) 
    layout_config: Mapped[dict] = mapped_column(JSON, nullable=False) 
    source: Mapped[str] = mapped_column(String, nullable=False, default="custom")

class MetaListView(Base):
    __tablename__ = "meta_list_views"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    object_id: Mapped[str] = mapped_column(String(36), ForeignKey("meta_objects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=True) 
    columns: Mapped[list] = mapped_column(JSON, nullable=False) 
    filter_criteria: Mapped[dict] = mapped_column(JSON, nullable=True)
    source: Mapped[str] = mapped_column(String, nullable=False, default="custom")
