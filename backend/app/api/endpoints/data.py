from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api.deps import get_db
from app.services.data_service import data_service
from app.services.meta_service import meta_service
from app.schemas.dynamic import create_dynamic_model, PaginatedResponse

router = APIRouter()

@router.post("/{object_name}")
def create_record(
    object_name: str, 
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    # Dynamic Validation
    obj = meta_service.get_object_by_name(db, object_name)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    
    DynamicModel = create_dynamic_model(obj)
    try:
        validated_data = DynamicModel(**body)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    try:
        return data_service.create_record(db, object_name, validated_data.model_dump(), user_id=None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{object_name}", response_model=PaginatedResponse[Dict[str, Any]])
def list_records(
    object_name: str, 
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    try:
        return data_service.list_records(db, object_name, skip, limit)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{object_name}/{record_uid}")
def get_record(
    object_name: str, 
    record_uid: str, 
    db: Session = Depends(get_db)
):
    record = data_service.get_record(db, object_name, record_uid)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.put("/{object_name}/{record_uid}")
def update_record(
    object_name: str, 
    record_uid: str,
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    obj = meta_service.get_object_by_name(db, object_name)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    
    try:
        updated = data_service.update_record(db, object_name, record_uid, body)
        if not updated:
             raise HTTPException(status_code=404, detail="Record not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{object_name}/{record_uid}")
def delete_record(
    object_name: str, 
    record_uid: str, 
    db: Session = Depends(get_db)
):
    success = data_service.delete_record(db, object_name, record_uid)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}
