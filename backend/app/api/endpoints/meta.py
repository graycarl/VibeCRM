from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.metadata import MetaObject, MetaObjectCreate, MetaField, MetaFieldCreate
from app.services.meta_service import meta_service
from app.api.deps import get_db

router = APIRouter()

@router.post("/objects", response_model=MetaObject)
def create_object(obj_in: MetaObjectCreate, db: Session = Depends(get_db)):
    try:
        return meta_service.create_object(db, obj_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/objects", response_model=List[MetaObject])
def list_objects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return meta_service.get_objects(db, skip, limit)

@router.get("/objects/{object_id}", response_model=MetaObject)
def get_object(object_id: str, db: Session = Depends(get_db)):
    obj = meta_service.get_object(db, object_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj

@router.delete("/objects/{object_id}")
def delete_object(object_id: str, db: Session = Depends(get_db)):
    success = meta_service.delete_object(db, object_id)
    if not success:
        raise HTTPException(status_code=404, detail="Object not found")
    return {"message": "Object deleted"}

@router.post("/objects/{object_id}/fields", response_model=MetaField)
def create_field(object_id: str, field_in: MetaFieldCreate, db: Session = Depends(get_db)):
    try:
        return meta_service.create_field(db, object_id, field_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
