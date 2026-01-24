from sqlalchemy.orm import Session
from app.models.layout import MetaPageLayout, MetaListView
from typing import List

class LayoutService:
    def create_page_layout(self, db: Session, object_id: str, name: str, config: dict, source: str = "custom") -> MetaPageLayout:
        layout = MetaPageLayout(
            object_id=object_id,
            name=name,
            layout_config=config,
            source=source
        )
        db.add(layout)
        db.commit()
        db.refresh(layout)
        return layout

    def get_page_layouts(self, db: Session, object_id: str) -> List[MetaPageLayout]:
        return db.query(MetaPageLayout).filter(MetaPageLayout.object_id == object_id).all()

    def create_list_view(self, db: Session, object_id: str, name: str, columns: list, filters: dict = None, source: str = "custom") -> MetaListView:
        view = MetaListView(
            object_id=object_id,
            name=name,
            columns=columns,
            filter_criteria=filters,
            source=source
        )
        db.add(view)
        db.commit()
        db.refresh(view)
        return view

    def get_list_views(self, db: Session, object_id: str) -> List[MetaListView]:
        return db.query(MetaListView).filter(MetaListView.object_id == object_id).all()

layout_service = LayoutService()
