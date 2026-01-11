<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Tasks: 迁移 DataTable 至 MUI DataGrid

**Feature Branch**: `004-migrate-to-datagrid`
**Spec**: `specs/004-migrate-to-datagrid/spec.md`

## Phase 1: Setup

*Goal: Initialize project dependencies and verify environment.*

- [ ] T001 Install `@mui/x-data-grid` dependency in frontend
  - Path: `frontend/package.json`

## Phase 2: Foundation

*Goal: Create the core reusable DataGrid wrapper component.*

- [ ] T002 [P] Create `DynamicDataGrid.test.tsx` test shell
  - Path: `frontend/tests/components/DynamicDataGrid.test.tsx`
  - Desc: Create component test file with basic render test case.
- [ ] T003 [P] Implement `DynamicDataGrid` component skeleton with Props interface
  - Path: `frontend/src/components/data/DynamicDataGrid.tsx`
  - Desc: Define `DynamicDataGridProps` based on data-model.md.
- [ ] T004 Implement `DynamicDataGrid` core logic
  - Path: `frontend/src/components/data/DynamicDataGrid.tsx`
  - Desc: Implement dynamic column generation from `MetaField` array using `useMemo`. Map Text, Number, Date, Boolean types.
- [ ] T005 Configure `DynamicDataGrid` features
  - Path: `frontend/src/components/data/DynamicDataGrid.tsx`
  - Desc: Add `DataGrid` component with pagination (10/25/50), `disableColumnSorting`, `disableColumnFilter`, and custom `sx` styling to match theme.
- [ ] T006 Add Actions column support to `DynamicDataGrid`
  - Path: `frontend/src/components/data/DynamicDataGrid.tsx`
  - Desc: Add logic to append an actions column if `actions` prop is provided.

## Phase 3: User Story 1 - View Object Record List (P1)

*Goal: Replace the legacy table in the record list view with the new DataGrid.*

- [ ] T007 [US1] Create test for `ObjectRecordList` integration with DataGrid
  - Path: `frontend/tests/ObjectRecordList_datagrid.test.tsx` (or update existing `ObjectRecordList.test.tsx`)
  - Desc: Verify that the list page renders the `DynamicDataGrid` component.
- [ ] T008 [US1] Refactor `ObjectRecordList` to use `DynamicDataGrid`
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Replace `DataTable` usage with `DynamicDataGrid`. Pass `fields` and `rows` from existing data hooks.
- [ ] T009 [US1] Verify Data Rendering
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Ensure all field types (especially Boolean and Date) render correctly in the new grid.

## Phase 4: User Story 2 - Record Actions (P1)

*Goal: Re-implement Edit and Delete actions within the DataGrid.*

- [ ] T010 [US2] Implement Actions renderer in `ObjectRecordList`
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Define the `actions` prop function to return Edit and Delete `IconButton`s.
- [ ] T011 [US2] Wire up Edit action
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Connect Edit button to navigation logic (existing behavior).
- [ ] T012 [US2] Wire up Delete action
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Connect Delete button to existing confirmation dialog and delete mutation.

## Phase 5: User Story 3 - Pagination & Cleanup (P2)

*Goal: Ensure pagination works and remove legacy code.*

- [ ] T013 [US3] Verify Pagination behavior
  - Path: `frontend/src/pages/runtime/ObjectRecordList.tsx`
  - Desc: Manual verification task (or update e2e test) to ensure pagination controls work for >10 records.
- [ ] T014 [US3] Remove legacy `DataTable` component
  - Path: `frontend/src/components/data/DataTable.tsx`
  - Desc: Delete the file.
- [ ] T015 [US3] Clean up imports
  - Path: `frontend/src/components/data/index.ts` (if exists) or other consumer files
  - Desc: Ensure no references to `DataTable` remain.

## Final Phase: Polish

*Goal: Final styling adjustments and code quality checks.*

- [ ] T016 Verify Styling Consistency
  - Path: `frontend/src/components/data/DynamicDataGrid.tsx`
  - Desc: Check headers, cell padding, and border styles against app theme. Adjust `sx` if needed.
- [ ] T017 Run full frontend test suite
  - Path: `frontend/`
  - Desc: Execute `npm test` or `vitest` to ensure no regressions.

## Dependencies

1. **Setup** (T001) must complete before **Foundation** (T002-T006).
2. **Foundation** must complete before **User Story 1** (T007).
3. **User Story 1** (Basic View) must complete before **User Story 2** (Actions).
4. **User Story 2** must complete before **User Story 3** (Cleanup).

## Parallel Execution

- T002 (Test Shell) and T003 (Component Skeleton) can be done in parallel.
- T010, T011, T012 can be implemented iteratively but depend on T008.

## Implementation Strategy

We will build the new `DynamicDataGrid` component alongside the existing `DataTable`. We will then swap them in `ObjectRecordList`. Once the swap is verified and all features (actions, pagination) are working, we will delete `DataTable`.
