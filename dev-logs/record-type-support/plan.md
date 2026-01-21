# Record Type Support - Implementation Plan

## Overview
Add first-class `record_type` support across the metadata model, runtime data layer, and UI (Admin + Runtime). Each object may enable a fixed `record_type` column storing option `name` values defined in an `ObjectRecordTypes` metadata table. System objects remain locked per source rules; custom objects are configurable. Runtime record creation flows must allow selecting record type before opening the form when multiple options exist, and the field must be displayed/read-only in layouts.

## Impacted Areas
- **Database / Models**: MetaObject schema, new ObjectRecordTypes table, physical data tables (record_type column), seeds/migrations for Account defaults.
- **Backend Services**: MetaService (record type CRUD, enable/disable rules), SchemaService (column management), DataService (validation, immutability checks), API endpoints (meta + data), Pydantic schemas.
- **Frontend Admin Console**: Object create/edit dialog, RecordType options management UI, metaApi client updates, permission handling.
- **Frontend Runtime App**: New record creation flow (record type selection dialog), DynamicForm read-only support, list/detail labeling, layout integration.
- **Shared Types / Layouts**: TypeScript metadata definitions, default page layout updates to include record_type.

## Detailed Steps

### 1. Database & ORM Layer
1. Add `has_record_type` boolean column to `meta_objects` (default false).
2. Create `meta_object_record_types` table with fields: `id`, `object_id` FK, `name`, `label`, `description`, `source`, `order`, timestamps.
3. Update ORM models (`MetaObject`, new `MetaObjectRecordType`) and relationships; extend Pydantic schemas.
4. Update SchemaService to always add a `record_type TEXT` column on object table creation, and a helper to retroactively add the column for existing tables. Ensure migrations add this column to current `data_*` tables.
5. Seed/migrate Account system object: set `has_record_type = true` and insert `professional` / `hospital` options (source=system). Backfill existing `data_account` records to a default (choose `professional` or explicit migration requirement).

### 2. Backend Services & API
1. **MetaService**
   - Accept `has_record_type` in create/update with source-based permissions (system objects: read-only toggle; custom objects: toggle allowed with validation).
   - CRUD for record type options: create/update/delete/reorder with name immutability, description/label edits respecting source rules. Enforce that enabling record_type requires ≥1 option, deleting requires no data references, and disabling requires zero data rows.
   - When returning MetaObject responses, include `has_record_type` and `record_types` array ordered by `order`.
2. **DataService**
   - Validate `record_type` presence/value when `has_record_type` is true (must match allowed option names).
   - Prevent `record_type` changes on update (reject payloads attempting to modify; leave stored value intact).
   - Provide helper queries for MetaService (check existing records, count usages per record type).
3. **API Endpoints**
   - Extend `/meta/objects` POST/PATCH payloads to include `has_record_type`.
   - Add routes for managing record type options (e.g., `/meta/objects/{object_id}/record-types` for list/create, `/meta/record-types/{id}` for update/delete, reorder endpoint).
   - Ensure responses include record type data and validation errors (e.g., deleting referenced option returns 400).
   - Data endpoints continue as-is but rely on new validation logic.

### 3. Frontend Admin Console
1. Update metadata types (`MetaObject`, `MetaField`) and API client (`metaApi`) with `has_record_type` and record type option interfaces.
2. Enhance `ObjectCreateDialog` and `ObjectDetail` pages:
   - Display a switch for enabling Record Type, subject to source restrictions (system = disabled/readonly).
   - When enabled, render `RecordTypeOptionsEditor` component for managing options (name/label/description, ordering) with backend integration. Enforce at least one option before saving.
   - On disabling attempt, call backend; surface error if object has data.
3. Build `RecordTypeOptionsEditor` component similar to picklist editor but without migration (deletion blocked when data exists). Provide inline validation and error messaging.

### 4. Frontend Runtime App
1. On "New" record action:
   - Fetch object metadata including record types. If `has_record_type`:
     - If only one option, automatically set that value and navigate to edit page with prefilling.
     - If multiple options, show `RecordTypeSelectorDialog` (MUI dialog) to choose label; once selected, pass the value via route state or query.
2. `ObjectRecordEdit` / `DynamicForm`:
   - Ensure `record_type` field is part of `fields` list (inject pseudo field when object has record type) so it renders in layout.
   - Render record_type as read-only (e.g., disabled Select/TextField) but still submitted during create. On edit, show existing label but prevent changes.
   - Guard against direct access to `/new` without preselected record_type by redirecting back to selector or auto-picking first option.
3. List & Detail pages:
   - Display record_type column/section using label (reuse `getOptionLabel`, referencing object `record_types`).
   - Ensure layout config includes `record_type`; update layout seeds/templates accordingly.

### 5. Validation & Testing
- Add backend unit tests: enabling/disabling record types, CRUD operations with permissions, data validation for record_type, deletion blocking with data.
- Add frontend tests: new selector dialog behavior, admin editor interactions, record form read-only behavior.
- Manual verification scenarios per requirements (system vs custom objects, multi-option dialogs, deletion blocks, etc.).

### 6. Deployment Considerations
- Introduce migration routine to add `has_record_type` column, create new table, and add `record_type` column to all data tables before deploying code.
- Ensure existing seeds/data align (Account record types present, layouts updated).
- Communicate that runtime requires re-fetching metadata to honor new field (clear caches if any).
