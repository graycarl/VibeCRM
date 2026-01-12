from typing import Generic, TypeVar, List, Dict, Any, Optional
from pydantic import BaseModel, create_model, Field
from datetime import datetime

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int

def create_dynamic_model(obj_meta):
    """
    Dynamically create a Pydantic model based on object metadata.
    """
    fields = {}
    
    for field in obj_meta.fields:
        field_type = str
        default = ...
        
        if field.data_type == 'Number':
            field_type = float
            default = 0.0
        elif field.data_type == 'Boolean':
            field_type = bool
            default = False
        elif field.data_type == 'Date' or field.data_type == 'Datetime':
            field_type = Optional[str] # Simplified for now, can be datetime
            default = None
            
        fields[field.name] = (field_type, default if field.required else None)
        
    return create_model(f"Dynamic_{obj_meta.name}", **fields)