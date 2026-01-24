from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db
from app.services.layout_service import layout_service

router = APIRouter()

class LayoutCreate(BaseModel):
    name: str
    config: dict
    source: str = "custom"

class ListViewCreate(BaseModel):
    name: str
    columns: list
    filter_criteria: dict = None
    source: str = "custom"

@router.post("/objects/{object_id}/layouts")
def create_layout(object_id: str, layout_in: LayoutCreate, db: Session = Depends(get_db)):
    return layout_service.create_page_layout(db, object_id, layout_in.name, layout_in.config, layout_in.source)

@router.get("/objects/{object_id}/layouts")
def get_layouts(object_id: str, db: Session = Depends(get_db)):
    return layout_service.get_page_layouts(db, object_id)

@router.post("/objects/{object_id}/list-views")
def create_list_view(object_id: str, view_in: ListViewCreate, db: Session = Depends(get_db)):
    return layout_service.create_list_view(db, object_id, view_in.name, view_in.columns, view_in.filter_criteria, view_in.source)

@router.get("/objects/{object_id}/list-views")
def get_list_views(object_id: str, db: Session = Depends(get_db)):
    return layout_service.get_list_views(db, object_id)
