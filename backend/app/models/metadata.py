import uuid
from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import String, Boolean, ForeignKey, Text, JSON, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base

class MetaObject(Base):
    __tablename__ = "meta_objects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String, nullable=False, default="custom") # system or custom
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    fields: Mapped[List["MetaField"]] = relationship("MetaField", back_populates="object", cascade="all, delete-orphan")

class MetaField(Base):
    __tablename__ = "meta_fields"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    object_id: Mapped[str] = mapped_column(String(36), ForeignKey("meta_objects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    data_type: Mapped[str] = mapped_column(String, nullable=False)
    options: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str] = mapped_column(String, nullable=False, default="custom")
    
    object: Mapped["MetaObject"] = relationship("MetaObject", back_populates="fields")

    __table_args__ = (
        UniqueConstraint('object_id', 'name', name='uq_field_object_name'),
    )

class MetaRole(Base):
    __tablename__ = "meta_roles"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    permissions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    source: Mapped[str] = mapped_column(String, nullable=False, default="custom")
