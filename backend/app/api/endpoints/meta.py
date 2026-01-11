from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.metadata import (
    MetaObject, MetaObjectCreate, 
    MetaField, MetaFieldCreate, MetaFieldUpdate,
    MetaRole, MetaRoleCreate, MetaRoleUpdate,
    PicklistOption, PicklistOptionUpdate, PicklistReorder
)
from app.services.meta_service import meta_service
from app.services.data_service import data_service
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

@router.patch("/fields/{field_id}", response_model=MetaField)
def update_field(field_id: str, field_in: MetaFieldUpdate, db: Session = Depends(get_db)):
    try:
        return meta_service.update_field(db, field_id, field_in.label, field_in.is_required)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Role Endpoints

@router.post("/roles", response_model=MetaRole)
def create_role(role_in: MetaRoleCreate, db: Session = Depends(get_db)):
    try:
        return meta_service.create_role(db, role_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roles", response_model=List[MetaRole])
def list_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return meta_service.get_roles(db, skip, limit)

@router.get("/roles/{role_id}", response_model=MetaRole)
def get_role(role_id: str, db: Session = Depends(get_db)):
    role = meta_service.get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/roles/{role_id}", response_model=MetaRole)
def update_role(role_id: str, role_in: MetaRoleUpdate, db: Session = Depends(get_db)):
    role = meta_service.update_role(db, role_id, role_in)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.delete("/roles/{role_id}")
def delete_role(role_id: str, db: Session = Depends(get_db)):
    try:
        success = meta_service.delete_role(db, role_id)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
        return {"message": "Role deleted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Picklist Options Endpoints

@router.post("/fields/{field_id}/options", response_model=MetaField, status_code=201)
def add_option(field_id: str, option: PicklistOption, db: Session = Depends(get_db)):
    try:
        return meta_service.add_option(db, field_id, option.name, option.label)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/fields/{field_id}/options/{name}", response_model=MetaField)
def update_option(field_id: str, name: str, option_update: PicklistOptionUpdate, db: Session = Depends(get_db)):
    try:
        return meta_service.update_option(db, field_id, name, option_update.label)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/fields/{field_id}/options/reorder", response_model=MetaField)
def reorder_options(field_id: str, reorder: PicklistReorder, db: Session = Depends(get_db)):
    try:
        return meta_service.reorder_options(db, field_id, reorder.names)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/fields/{field_id}/options/{name}", response_model=MetaField)
def delete_option(
    field_id: str, 
    name: str, 
    migrate_to: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Perform migration before deleting from metadata
        data_service.migrate_picklist_values(db, field_id, name, migrate_to)
        return meta_service.delete_option(db, field_id, name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))