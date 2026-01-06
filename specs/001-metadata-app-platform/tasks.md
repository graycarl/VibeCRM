# Tasks: 元数据驱动应用开发平台

**Feature**: `001-metadata-app-platform`
**Status**: Pending
**Generated**: 2026-01-07

## Phase 1: Setup & Configuration
**Goal**: Initialize project structure and environment for backend and frontend.

- [x] T001 Create backend project structure (FastAPI) in `backend/`
- [x] T002 Create frontend project structure (Vite + React + TS) in `frontend/`
- [x] T003 [P] Configure backend environment and settings in `backend/app/core/config.py`
- [x] T004 [P] Configure frontend theme (MUI) and routing in `frontend/src/theme/index.ts` and `frontend/src/App.tsx`

## Phase 2: Foundation (Blocking)
**Goal**: Establish database connectivity, core metadata models, and schema management services.
**Dependent Stories**: All

- [x] T005 Setup SQLAlchemy (Sync) Engine and Session in `backend/app/db/session.py`
- [x] T006 Define Metadata ORM Models (`meta_objects`, `meta_fields`) in `backend/app/models/metadata.py`
- [x] T007 Implement Schema Service for DDL operations (Create Table, Add Column) in `backend/app/services/schema_service.py`
- [x] T008 Implement Database Init script (Create metadata tables) in `backend/app/db/init_db.py`
- [x] T009 Create Pydantic Schemas for Metadata in `backend/app/schemas/metadata.py`
- [x] T010 Implement MetaService for metadata persistence in `backend/app/services/meta_service.py`
- [x] T010a Setup Auth Utilities (Password Hashing, JWT/Session) in `backend/app/core/security.py`
- [x] T010b Implement Login API Endpoint in `backend/app/api/endpoints/auth.py`
- [x] T010c [P] Create Login Page & Auth Context in `frontend/src/pages/auth/Login.tsx`

## Phase 3: User Story 1 - Define Objects & Fields
**Goal**: Allow admins to define Custom Objects and Fields via API and UI.
**Priority**: P1

### Independent Test Criteria
- Admin can create a "TestObject" via UI/API.
- Admin can add fields (Text, Number, Date) to "TestObject".
- Metadata is persisted and physical tables are created/altered in SQLite.

### Tasks
- [x] T011 [US1] Implement API Endpoints for Objects and Fields in `backend/app/api/endpoints/meta.py`
- [x] T012 [US1] Implement Backend Tests for Metadata APIs in `backend/tests/api/test_meta.py`
- [x] T013 [P] [US1] Create Frontend API Client for Metadata in `frontend/src/services/metaApi.ts`
- [x] T014 [P] [US1] Create Admin Object List Page in `frontend/src/pages/admin/ObjectList.tsx`
- [x] T015 [P] [US1] Create Admin Object Create Dialog in `frontend/src/components/admin/ObjectCreateDialog.tsx`
- [x] T016 [P] [US1] Create Admin Object Detail Page (Field List) in `frontend/src/pages/admin/ObjectDetail.tsx`
- [x] T017 [P] [US1] Create Admin Field Create Dialog (Field Type Selection) in `frontend/src/components/admin/FieldCreateDialog.tsx`

## Phase 4: User Story 2 - Dynamic Data Runtime
**Goal**: Allow end-users to CRUD records for defined objects using dynamically generated UIs.
**Priority**: P1

### Independent Test Criteria
- User can list records for "TestObject".
- User can create a new record via a dynamically rendered form.
- User can view record details.
- Data is correctly stored in `data_test_object` table.

### Tasks
- [x] T018 [US2] Implement DataService for dynamic SQL generation (Insert/Select) in `backend/app/services/data_service.py`
- [x] T019 [US2] Implement Dynamic Pydantic Model Factory in `backend/app/schemas/dynamic.py`
- [x] T020 [US2] Implement Generic Data API Endpoints (`/api/v1/data/{object}`) in `backend/app/api/endpoints/data.py`
- [x] T021 [US2] Implement Backend Tests for Data APIs in `backend/tests/api/test_data.py`
- [x] T022 [P] [US2] Create Frontend API Client for Data in `frontend/src/services/dataApi.ts`
- [x] T023 [P] [US2] Create Dynamic Form Component Factory in `frontend/src/components/dynamic/DynamicForm.tsx`
- [x] T024 [P] [US2] Create Generic Data Table Component in `frontend/src/components/dynamic/DataTable.tsx`
- [x] T025 [P] [US2] Implement Runtime Record List Page in `frontend/src/pages/runtime/ObjectRecordList.tsx`
- [x] T026 [P] [US2] Implement Runtime Record Create/Edit Page in `frontend/src/pages/runtime/ObjectRecordEdit.tsx`
- [x] T027 [P] [US2] Implement Runtime Record Detail Page in `frontend/src/pages/runtime/ObjectRecordDetail.tsx`

## Phase 5: User Story 3 - Admin Configure Layouts
**Goal**: Allow admins to configure Page Layouts and List Views.
**Priority**: P2

### Independent Test Criteria
- Admin can define a List View with specific columns.
- Admin can define a Page Layout with specific field ordering.
- Runtime pages reflect these configurations.

### Tasks
- [x] T028 [US3] Define Layout & ListView ORM Models in `backend/app/models/layout.py`
- [x] T029 Implement Layout & ListView Services in `backend/app/services/layout_service.py`
- [x] T030 Implement Layout & ListView API Endpoints in `backend/app/api/endpoints/layout.py`
- [x] T030a [US3] Implement Backend Tests for Layout & ListView APIs in `backend/tests/api/test_layout.py`
- [x] T031 [P] [US3] Create Admin List View Editor in `frontend/src/pages/admin/ListViewEditor.tsx`
- [x] T032 [P] [US3] Create Admin Page Layout Editor in `frontend/src/pages/admin/PageLayoutEditor.tsx`
- [x] T033 [US3] Update Runtime Pages to respect Layout/View configurations in `frontend/src/pages/runtime/ObjectRecordList.tsx`

## Phase 6: Polish & Cross-Cutting
**Goal**: Finalize system seeding, permissions, and end-to-end verification.

- [x] T034 Define System Objects (User, Role) Seeds in `backend/app/db/seeds.py`
- [x] T035 Implement Seed Execution on Startup in `backend/app/main.py`
- [x] T036 Implement Basic Role-Based Permission Checks in `backend/app/services/auth_service.py`
- [x] T037 Perform E2E Verification of full flow (Define -> Configure -> Use) in `tests/e2e/test_full_flow.md`

## Dependencies

- **US1 (Define Objects)** is the prerequisite for all other stories.
- **US2 (Runtime)** depends on US1.
- **US3 (Layouts)** depends on US1 (for object definitions) and enhances US2 (runtime display).

## Parallel Execution Opportunities

- **Frontend & Backend**: Within each User Story phase, Frontend tasks (UI/Client) can largely proceed in parallel with Backend tasks (Service/API) once the API contract is agreed upon.
- **US2 & US3**: US3 (Layouts) can technically start development alongside US2 (Runtime), but integration requires US2 to be functional first.

## Implementation Strategy

1.  **MVP (Phase 1-4)**: Focus on getting the "Define Object -> Generate Default UI -> Create Data" loop working first. Ignore custom layouts initially (just show all fields).
2.  **Enhancement (Phase 5)**: Add Layouts and List Views to refine the user experience.
3.  **Polish (Phase 6)**: Ensure system objects are seeded and permissions work basic checks.
