# Metadata Field Implementation Todo List

## Backend
- [x] **Model & Schema**
  - [x] Update `MetaField` SQLAlchemy model in `backend/app/models/metadata.py` to include `metadata_name`.
  - [x] Update Pydantic schemas in `backend/app/schemas/metadata.py` (`MetaFieldCreate`, `MetaFieldUpdate`, `MetaField`) to include `metadata_name`.
  - [x] Update validation logic in `meta_service.py` to ensure `metadata_name` is present for Metadata fields and absent for others.

- [x] **Metadata Service**
  - [x] Implement `get_all_metadata_options()` in `meta_service.py` to return a list of `{value, label}` for all metadata entities (Objects, Fields, RecordTypes, Layouts, etc.).
  - [x] Handle composite keys for fields (`obj.name.field.name`) and record types (`obj.name.rt.name`).

- [x] **Data Service**
  - [x] Update `_validate_data` in `data_service.py` to validate Metadata field values against existing metadata names.
  - [x] Implement `_enrich_metadata_fields` in `data_service.py` (similar to `_enrich_lookup_fields`) to populate `__label` fields.
  - [x] Integrate enrichment into `get_record` and `list_records`.

- [x] **API**
  - [x] Create endpoint `GET /api/v1/meta/options` (or similar) to expose the metadata options to the frontend.

- [x] **Tests**
  - [x] Add unit tests in `backend/tests/unit/` covering:
    - [x] Field creation with `metadata_name`.
    - [x] Record creation with valid/invalid metadata references.
    - [x] Enrichment logic (including "deleted" fallback).

## Frontend
- [x] **API Client**
  - [x] Update `frontend/src/services/metaApi.ts`:
    - [x] Add `metadata_name` to `MetaField` interface.
    - [x] Add `getMetadataOptions` method.

- [x] **Admin Console**
  - [x] Update `frontend/src/components/admin/FieldCreateDialog.tsx`:
    - [x] Add 'Metadata' to `FIELD_TYPES`.
    - [x] Implement conditional rendering for `metadata_name` selector (Autocomplete/Select).
    - [x] Fetch options using the new API.
    - [x] Ensure `metadata_name` is read-only in Edit mode.

- [x] **Runtime App**
  - [x] Update `frontend/src/components/dynamic/DynamicForm.tsx`:
    - [x] Add case for 'Metadata' type.
    - [x] Render as read-only TextField displaying the `__label`. (Implemented as Autocomplete for selection)
  - [x] Update `frontend/src/components/data/DynamicDataGrid.tsx`:
    - [x] Handle 'Metadata' type in `renderCell` (use `__label`).
  - [x] Update `frontend/src/pages/runtime/ObjectRecordDetail.tsx`:
    - [x] Ensure `FieldSection` renders Metadata fields correctly.

## Verification
- [x] **E2E / Manual**
  - [x] Backend Unit Tests passed.
  - [x] Frontend Component Tests passed.
