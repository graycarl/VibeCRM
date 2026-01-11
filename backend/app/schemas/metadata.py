from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class PicklistOption(BaseModel):
    name: str
    label: str

class PicklistOptionUpdate(BaseModel):
    label: str

class PicklistReorder(BaseModel):
    names: List[str]

class MetaFieldBase(BaseModel):
    name: str
    label: str
    data_type: str
    options: Optional[List[PicklistOption]] = None
    is_required: bool = False
    source: str = "custom"

class MetaFieldCreate(MetaFieldBase):
    pass 

class MetaFieldUpdate(BaseModel):
    label: Optional[str] = None
    is_required: Optional[bool] = None

class MetaField(MetaFieldBase):
    id: str 
    object_id: str
    
    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

class MetaRoleBase(BaseModel):
    name: str
    label: str
    description: Optional[str] = None
    permissions: Optional[Any] = None
    source: str = "custom"

class MetaRoleCreate(MetaRoleBase):
    pass

class MetaRoleUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Any] = None

class MetaRole(MetaRoleBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)