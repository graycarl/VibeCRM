# Tasks: Add Datetime Field & System Timestamp

**Feature**: `006-add-datetime-field`
**Status**: Completed
**Derived From**: [specs/006-add-datetime-field/plan.md](./plan.md)

## Phase 1: Setup & Configuration
*Goal: Prepare database seeds and configuration for the new fields.*

- [x] T001 Update system object definitions in `db/seed/meta.yml` to include `created_at` and `updated_at` fields for `user` and `account`.

## Phase 2: User Story 1 - Support Datetime Field Type (P1)
*Goal: Allow creating and storing Datetime fields in the metadata engine.*

### Independent Test Criteria
- Can create a custom object with a `Datetime` field.
- Database column is created as `TEXT`.
- Frontend displays a datetime picker.

### Tasks
- [x] T002 [US1] Update `SchemaService` in `backend/app/services/schema_service.py` to map `Datetime` type to SQLite `TEXT`.
- [x] T003 [P] [US1] Update `MetaField` interface in `frontend/src/services/metaApi.ts` to include `Datetime` in `data_type` union.
- [x] T004 [US1] Update `DynamicForm` in `frontend/src/components/dynamic/DynamicForm.tsx` to render `TextField` with `type="datetime-local"` for `Datetime` fields.
- [x] T005 [US1] Implement value conversion (UTC <-> Local) in `DynamicForm` for `Datetime` fields.

## Phase 3: User Story 2 - System Object Auto-Timestamp (P1)
*Goal: Automatically manage `created_at` and `updated_at` on the backend.*

### Independent Test Criteria
- Creating a record automatically sets `created_at` and `updated_at` to current UTC ISO string.
- Updating a record automatically updates `updated_at`.
- Client cannot manually set these fields during create/update.

### Tasks
- [x] T006 [US2] Update `DataService.create_record` in `backend/app/services/data_service.py` to inject `created_at` and `updated_at` timestamps.
- [x] T007 [US2] Update `DataService.update_record` in `backend/app/services/data_service.py` to inject `updated_at` timestamp.
- [x] T008 [US2] Update `DataService.update_record` to strictly exclude `created_at` and `updated_at` from the update payload (prevent client override).
- [x] T009 [US2] Create unit tests in `backend/tests/unit/test_data_service.py` to verify timestamp injection and protection logic.

## Phase 4: User Story 3 - UI Visualization & Read-only (P2)
*Goal: Display timestamps correctly and prevent editing in the UI.*

### Independent Test Criteria
- `created_at` and `updated_at` are visible in Detail View.
- These fields are disabled (read-only) in Edit View.
- List View defaults to sorting by `created_at` DESC.

### Tasks
- [x] T010 [US3] Update `DynamicForm` in `frontend/src/components/dynamic/DynamicForm.tsx` to set `disabled={true}` for fields named `created_at` or `updated_at`.
- [x] T011 [US3] Verify and update default sorting logic in `backend/app/services/data_service.py` (or `list_records`) to default to `created_at DESC` if no sort is provided.
- [x] T012 [US3] Create component tests in `frontend/tests/components/DynamicForm.test.tsx` to verify datetime rendering and read-only state.

## Phase 5: Verification & Polish
*Goal: Ensure end-to-end functionality and migration of seeds.*

- [x] T013 Re-initialize database to apply new seeds: `rm vibe.db && make init-db`.
- [x] T014 Run manual validation steps from `quickstart.md`.