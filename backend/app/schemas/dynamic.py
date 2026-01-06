from pydantic import create_model, BaseModel
from typing import Any, Dict, Type, Optional
from app.models.metadata import MetaObject

def get_pydantic_type(field_type: str) -> Type:
    if field_type == "Number":
        return float
    elif field_type == "Boolean":
        return bool
    elif field_type == "Date":
        return str 
    elif field_type == "Lookup":
        return int
    else:
        return str

def create_dynamic_model(obj: MetaObject) -> Type[BaseModel]:
    fields: Dict[str, Any] = {}
    
    for field in obj.fields:
        py_type = get_pydantic_type(field.data_type)
        if not field.is_required:
            fields[field.name] = (Optional[py_type], None)
        else:
            fields[field.name] = (py_type, ...)
    
    # We allow extra fields in case of system fields or loose validation for MVP
    # But ideally strict.
    
    return create_model(f"{obj.name}Model", **fields)
