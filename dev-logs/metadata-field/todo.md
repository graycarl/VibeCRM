# Metadata Field Implementation Todo List

## Backend
- [ ] **Model & Schema**
  - [ ] Update `MetaField` SQLAlchemy model in `backend/app/models/metadata.py` to include `metadata_name`.
  - [ ] Update Pydantic schemas in `backend/app/schemas/metadata.py` (`MetaFieldCreate`, `MetaFieldUpdate`, `MetaField`) to include `metadata_name`.
  - [ ] Update validation logic in `meta_service.py` to ensure `metadata_name` is present for Metadata fields and absent for others.

- [ ] **Metadata Service**
  - [ ] Implement `get_all_metadata_options()` in `meta_service.py` to return a list of `{value, label}` for all metadata entities (Objects, Fields, RecordTypes, Layouts, etc.).
  - [ ] Handle composite keys for fields (`obj.name.field.name`) and record types (`obj.name.rt.name`).

- [ ] **Data Service**
  - [ ] Update `_validate_data` in `data_service.py` to validate Metadata field values against existing metadata names.
  - [ ] Implement `_enrich_metadata_fields` in `data_service.py` (similar to `_enrich_lookup_fields`) to populate `__label` fields.
  - [ ] Integrate enrichment into `get_record` and `list_records`.

- [ ] **API**
  - [ ] Create endpoint `GET /api/v1/meta/options` (or similar) to expose the metadata options to the frontend.

- [ ] **Tests**
  - [ ] Add unit tests in `backend/tests/unit/` covering:
    - [ ] Field creation with `metadata_name`.
    - [ ] Record creation with valid/invalid metadata references.
    - [ ] Enrichment logic (including "deleted" fallback).

## Frontend
- [ ] **API Client**
  - [ ] Update `frontend/src/services/metaApi.ts`:
    - [ ] Add `metadata_name` to `MetaField` interface.
    - [ ] Add `getMetadataOptions` method.

- [ ] **Admin Console**
  - [ ] Update `frontend/src/components/admin/FieldCreateDialog.tsx`:
    - [ ] Add 'Metadata' to `FIELD_TYPES`.
    - [ ] Implement conditional rendering for `metadata_name` selector (Autocomplete/Select).
    - [ ] Fetch options using the new API.
    - [ ] Ensure `metadata_name` is read-only in Edit mode.

- [ ] **Runtime App**
  - [ ] Update `frontend/src/components/dynamic/DynamicForm.tsx`:
    - [ ] Add case for 'Metadata' type.
    - [ ] Render as read-only TextField displaying the `__label`.
  - [ ] Update `frontend/src/components/data/DynamicDataGrid.tsx`:
    - [ ] Handle 'Metadata' type in `renderCell` (use `__label`).
  - [ ] Update `frontend/src/pages/runtime/ObjectRecordDetail.tsx`:
    - [ ] Ensure `FieldSection` renders Metadata fields correctly.

## Verification
- [ ] **E2E / Manual**
  - [ ] Create a Metadata Field (e.g., `target_meta`) on an object.
  - [ ] Create a record selecting a specific object/field as the value.
  - [ ] Verify the label appears in List View and Detail View.
  - [ ] Verify validation errors if value is manipulated to be invalid.
