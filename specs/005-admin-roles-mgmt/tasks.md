# Tasks: Admin Roles Management

**Input**: Design documents from `/specs/005-admin-roles-mgmt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md
**Tests**: Tests are MANDATORY as per the project constitution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: [US1] Backend API, [US2] Frontend Navigation, [US3] Role Management UI
- **[Setup]**: Infrastructure tasks
- **[Foundational]**: Blocking prerequisites

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Verify backend environment and database connection
- [ ] T002 Verify frontend environment and dependencies

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Verify `MetaRole` SQLAlchemy model exists in `backend/app/models/metadata.py`

## Phase 3: User Story 1 - Backend API (Priority: P1)

**Goal**: Implement CRUD APIs for Roles to support management functions.

### Tests for User Story 1
- [ ] T004 [US1] Create test for Role CRUD operations in `backend/tests/api/test_meta.py`

### Implementation for User Story 1
- [ ] T005 [P] [US1] Define Pydantic schemas for Roles in `backend/app/schemas/metadata.py`
- [ ] T006 [US1] Implement Role CRUD logic in `backend/app/services/meta_service.py`
- [ ] T007 [US1] Expose Role API endpoints in `backend/app/api/endpoints/meta.py`
- [ ] T008 [US1] Verify API endpoints with `curl` or Postman

## Phase 4: User Story 2 - Frontend Navigation (Priority: P1)

**Goal**: Organize Admin Console navigation with a "Setup" submenu.

### Implementation for User Story 2
- [ ] T009 [US2] Update `metaApi.ts` to include Role API methods in `frontend/src/services/metaApi.ts`
- [ ] T010 [US2] Update `MainLayout.tsx` to add "Setup" submenu and "Roles" link in `frontend/src/layouts/MainLayout.tsx`

## Phase 5: User Story 3 - Role Management UI (Priority: P1)

**Goal**: Provide a UI for listing, creating, and editing roles.

### Tests for User Story 3
- [ ] T011 [US3] Create component test for RoleList in `frontend/tests/pages/admin/RoleList.test.tsx`

### Implementation for User Story 3
- [ ] T012 [P] [US3] Create `RoleCreateDialog` component in `frontend/src/components/admin/RoleCreateDialog.tsx`
- [ ] T013 [US3] Create `RoleList` page component in `frontend/src/pages/admin/RoleList.tsx`
- [ ] T014 [US3] Register `/admin/roles` route (if not auto-handled) in `frontend/src/App.tsx` (or where routes are defined)

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T015 Verify "Setup" menu expansion/collapse behavior
- [ ] T016 Verify System Role protection (cannot delete)
- [ ] T017 Update documentation if necessary
