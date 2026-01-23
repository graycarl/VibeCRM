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

class RecordTypeReorder(BaseModel):
    id_list: List[str]

class MetaFieldBase(BaseModel):
    name: str
    label: str
    description: Optional[str] = None
    data_type: str
    options: Optional[List[PicklistOption]] = None
    lookup_object: Optional[str] = None
    is_required: bool = False
    source: str = "custom"

class MetaFieldCreate(MetaFieldBase):
    pass 

class MetaFieldUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
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
    has_record_type: bool = False
    name_field: Optional[str] = None

class MetaObjectCreate(MetaObjectBase):
    pass

class MetaObjectUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    has_record_type: Optional[bool] = None
    name_field: Optional[str] = None

class MetaObjectRecordTypeBase(BaseModel):
    name: str
    label: str
    description: Optional[str] = None
    source: str = "custom"
    order: int = 0

class MetaObjectRecordTypeCreate(MetaObjectRecordTypeBase):
    pass

class MetaObjectRecordTypeUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None

class MetaObjectRecordType(MetaObjectRecordTypeBase):
    id: str
    object_id: str
    created_on: datetime
    
    model_config = ConfigDict(from_attributes=True)

class MetaObject(MetaObjectBase):
    id: str
    created_on: datetime
    fields: List[MetaField] = []
    record_types: List[MetaObjectRecordType] = []

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