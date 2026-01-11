# Research: Add Datetime Field & System Timestamp

## 1. Backend Implementation

### MetaField & SchemaService
- **Goal**: Support `Datetime` data type and map it to SQLite.
- **Findings**:
  - `backend/app/models/metadata.py`: Need to ensure `MetaField` model accepts 'Datetime' in valid types.
  - `backend/app/services/schema_service.py`: `add_column` method maps `data_type` to SQL types.
    - Current: `Text` -> `TEXT`, `Number` -> `REAL`, `Boolean` -> `INTEGER`, `Lookup` -> `INTEGER`.
    - **Decision**: Add `Datetime` -> `TEXT` mapping. SQLite doesn't have native datetime; ISO8601 strings are standard.
- **Data Seeding**:
  - `db/seed/meta.yml` defines system objects.
  - **Decision**: Add `created_at` and `updated_at` field definitions to `user` and `account` objects in `meta.yml`.

### API & Data Service
- **Goal**: Auto-populate `created_at` and `updated_at`.
- **Findings**:
  - `backend/app/services/data_service.py`: `create_record` handles insertion; `update_record` handles updates.
  - **Decision (Create)**: Inject `created_at = datetime.utcnow().isoformat()` AND `updated_at = datetime.utcnow().isoformat()` before insertion.
  - **Decision (Update)**: Inject `updated_at = datetime.utcnow().isoformat()` before update. Explicitly exclude `created_at` from input data.
  - **Schema**: `backend/app/schemas/dynamic.py`. Ensure `created_at` and `updated_at` are `readOnly`.

## 2. Frontend Implementation

### DynamicForm
- **Goal**: Render `Datetime` fields; Handle `created_at`/`updated_at` read-only state.
- **Findings**:
  - `frontend/src/components/dynamic/DynamicForm.tsx` switches on `field.data_type`.
  - **Decision**:
    - Add `case 'Datetime':` rendering `<TextField type="datetime-local" />`.
    - **Timezone handling**:
      - Value from API: UTC ISO8601.
      - Input requires: `YYYY-MM-DDThh:mm` (Local).
      - **Logic**: Convert UTC -> Local for display; Local -> UTC for save.
    - **Read-Only**:
      - Logic: `const isDisabled = ['created_at', 'updated_at'].includes(field.name);`
      - Apply `disabled={isDisabled}`.

### MetaApi
- **Goal**: Update TypeScript types.
- **Findings**:
  - `frontend/src/services/metaApi.ts`: `MetaField` interface.
  - **Decision**: Add `'Datetime'` to `data_type` union.

## 3. Unknowns & Clarifications
- **Resolved**: `updated_at` is now included.
- **Resolved**: Seed data does NOT need explicit timestamps; backend handles it.
- **Resolved**: List View should sort by `created_at` DESC by default.

## 4. Conclusion
- Backend: Update SchemaService mapping, DataService injection (create & update), meta.yml seed.
- Frontend: Update DynamicForm with Datetime support + ReadOnly logic for both fields.
- API: Enforce read-only logic.