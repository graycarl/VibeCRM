---
description: "Task list for feature 008-runtime-backend-pagination"
---

# Tasks: Runtime App Backend Pagination

**Input**: Design documents from `/specs/008-runtime-backend-pagination/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are MANDATORY as per the project constitution. Every user story must have corresponding tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies for backend (FastAPI) and frontend (MUI X DataGrid)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create generic pagination response schema in `backend/app/schemas/dynamic.py`
- [x] T003 Update backend `list_records` in `backend/app/services/data_service.py` to support count query and return `items` + `total`
- [x] T004 Update backend API endpoint `list_records` in `backend/app/api/endpoints/data.py` to use new response schema

**Checkpoint**: Foundation ready - API now returns `{"items": [], "total": 0}` format

---

## Phase 3: User Story 1 - 浏览并翻页查看大量数据 (Priority: P1) 🎯 MVP

**Goal**: Users can view lists of records > 50 items and navigate pages.

**Independent Test**: Generate >50 records, verify "Next" button loads records 51+ and pagination control shows correct total.

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Create backend API test for pagination in `backend/tests/api/test_data_pagination.py`
- [x] T006 [P] [US1] Create frontend test for DataGrid server pagination in `frontend/tests/components/DynamicDataGrid_pagination.test.tsx`

### Implementation for User Story 1

- [x] T007 [US1] Update `frontend/src/services/dataApi.ts` to type the response as `{ items: any[], total: number }`
- [x] T008 [US1] Update `frontend/src/components/data/DynamicDataGrid.tsx` to accept `rowCount`, `paginationModel`, `onPaginationModelChange` props and set `paginationMode="server"`
- [x] T009 [US1] Update `frontend/src/pages/runtime/ObjectRecordList.tsx` to manage pagination state and pass it to `DynamicDataGrid`
- [x] T010 [US1] Update `frontend/src/pages/runtime/ObjectRecordList.tsx` to fetch data using `paginationModel.page` and `paginationModel.pageSize`

**Checkpoint**: User Story 1 functional - pagination works for >50 records

---

## Phase 4: User Story 2 - 调整每页显示数量 (Priority: P2)

**Goal**: Users can change page size (10, 25, 50) and the list updates accordingly.

**Independent Test**: Change "Rows per page" to 10, verify list shows 10 items and total pages increases.

### Tests for User Story 2 ⚠️

- [x] T011 [P] [US2] Add test case for changing page size in `frontend/tests/components/DynamicDataGrid_pagination.test.tsx`

### Implementation for User Story 2

- [x] T012 [US2] Update `frontend/src/components/data/DynamicDataGrid.tsx` to ensure `pageSizeOptions` includes [10, 25, 50] and handles change events correctly (already standard in DataGrid but needs verification with server mode)
- [x] T013 [US2] Ensure `frontend/src/pages/runtime/ObjectRecordList.tsx` resets page to 0 when page size changes (per Clarification in spec)

**Checkpoint**: User Stories 1 AND 2 functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 [P] Verify error handling in `ObjectRecordList.tsx` (e.g. if backend returns 500)
- [x] T015 [P] Verify loading state behavior in `DynamicDataGrid.tsx` during page transitions
- [x] T016 [P] Run verification steps in `specs/008-runtime-backend-pagination/quickstart.md`
- [x] T017 [P] Clean up any unused legacy pagination code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1. BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase.
- **Polish (Phase 5)**: Depends on User Stories.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational API changes (T002-T004).
- **User Story 2 (P2)**: Depends on User Story 1 implementation of state management in `ObjectRecordList.tsx`.

### Parallel Opportunities

- T005 (Backend Test) and T006 (Frontend Test) can run in parallel.
- T014 (Error Handling) and T015 (Loading State) can run in parallel with US2 or after US1.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Foundational backend changes (T002-T004).
2. Write tests (T005, T006).
3. Implement Frontend connection (T007-T010).
4. **STOP and VALIDATE**: Can we see page 2 of 55 records?

### Incremental Delivery

1. Deliver US1 (Basic Pagination).
2. Deliver US2 (Page Size Selection) + Polish.
