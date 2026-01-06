from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class MetaFieldBase(BaseModel):
    name: str
    label: str
    data_type: str
    options: Optional[Any] = None
    is_required: bool = False
    source: str = "custom"

class MetaFieldCreate(MetaFieldBase):
    pass 

class MetaField(MetaFieldBase):
    id: str 
    object_id: str
    
    class Config:
        from_attributes = True

class MetaObjectBase(BaseModel):
    name: str
    label: str
    description: Optional[str] = None
    source: str = "custom"

class MetaObjectCreate(MetaObjectBase):
    pass

class MetaObject(MetaObjectBase):
    id: str
    created_at: datetime
    fields: List[MetaField] = []

    class Config:
        from_attributes = True
