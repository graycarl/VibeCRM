from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, create_model, ConfigDict

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
        # Skip auto-generated system fields
        if field.name in ('uid', 'created_on', 'modified_on', 'owner_id'):
            continue
            
        field_type = str
        default = None
        
        if field.data_type == 'Number':
            field_type = float
        elif field.data_type == 'Boolean':
            field_type = bool
        elif field.data_type == 'Lookup':
            field_type = int
        elif field.data_type == 'Date' or field.data_type == 'Datetime':
            field_type = Optional[str] # Simplified for now, can be datetime
            default = None
            
        # Use 'is_required' attribute and Ellipsis (...) for required fields
        is_required = getattr(field, "is_required", getattr(field, "required", False))
        fields[field.name] = (field_type, ... if is_required else default)
    
    # Add record_type field if enabled
    if getattr(obj_meta, 'has_record_type', False):
        fields['record_type'] = (Optional[str], None)
        
    return create_model(f"Dynamic_{obj_meta.name}", **fields)

class RecordCreate(BaseModel):
    # Base schema for creating a record, allowing extra fields dynamically
    model_config = ConfigDict(extra="allow")

class RecordUpdate(BaseModel):
    # Base schema for updating a record
    model_config = ConfigDict(extra="allow")
