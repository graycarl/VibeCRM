# Research: Runtime App Backend Pagination

**Feature**: Runtime App Backend Pagination
**Status**: Completed

## 1. Backend Pagination Strategy (SQLite + SQLAlchemy)

**Decision**: Use `SELECT COUNT(*) FROM table` via `sqlalchemy.text` for total count, separate from the data query.

**Rationale**:
- Since we use "Table-Per-Object" with dynamic table names (e.g., `data_custom_obj`), we rely on raw SQL construction in `data_service.py`.
- `COUNT(*)` is efficient enough for SQLite at the target scale (10k records).
- Combined with `LIMIT` and `OFFSET` for the data query.

**Implementation Details**:
```python
# Count query
count_stmt = text(f"SELECT COUNT(*) FROM {table_name}")
total = conn.execute(count_stmt).scalar()

# Data query
data_stmt = text(f"SELECT * FROM {table_name} ORDER BY created_at DESC LIMIT :limit OFFSET :skip")
items = conn.execute(data_stmt, ...).mappings().all()
```

## 2. API Response Schema (Pydantic V2)

**Decision**: Use Pydantic V2 Generics to define a standard `PaginatedResponse[T]`.

**Rationale**:
- Provides strong typing for Swagger/OpenAPI documentation.
- Ensures consistency across all paginated endpoints.

**Implementation Details**:
```python
from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
```

## 3. Frontend DataGrid Configuration (MUI X)

**Decision**: Configure `DataGrid` for server-side pagination.

**Rationale**:
- `DataGrid` supports `paginationMode="server"`.
- We need to manage `paginationModel` (page, pageSize) in the parent component state (`ObjectRecordList`) and pass it down.

**Implementation Details**:
- **Props**:
  - `paginationMode="server"`
  - `rowCount={total}`
  - `paginationModel={paginationModel}` (controlled)
  - `onPaginationModelChange={setPaginationModel}`
  - `loading={loading}`
- **State**:
  - `paginationModel` state: `{ page: 0, pageSize: 50 }`
  - `total` state: from API response.

## 4. Alternatives Considered

- **Cursor-based Pagination**: Better for performance on huge datasets, but harder to implement "Jump to Page X" which is a common requirement for admin-style lists. Offset-based is sufficient for <100k records.
- **Client-side Pagination (Current)**: Rejected because it doesn't support large datasets (>50 records).
