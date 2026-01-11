---
description: "Task list for Picklist field implementation"
---

# Tasks: 完善 Picklist 类型字段实现 (007-picklist-field)

**Input**: Design documents from `specs/007-picklist-field/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/options.md`

**Tests**: Tests are MANDATORY as per the project constitution. Every user story must have corresponding tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Define TypeScript types for Picklist Option in `frontend/src/types/metadata.ts`
- [ ] T002 [P] Update `MetaField` Pydantic schemas to include `options` structure in `backend/app/schemas/metadata.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Implement `MetaService` helper methods for options manipulation in `backend/app/services/meta_service.py`
- [ ] T004 [P] Create backend unit tests for `MetaService` options logic in `backend/tests/unit/test_meta_service_options.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 管理员定义 Picklist 字段选项 (Priority: P1) 🎯 MVP

**Goal**: 管理员能在 Admin Console 为 Picklist 字段定义、修改和删除选项（Name/Label），并实时保存。

**Independent Test**: 通过 Admin Console 创建一个包含 "male/男", "female/女" 选项的 Picklist 字段，刷新后确认选项仍然存在且 API 返回正确 JSON。

### Tests for User Story 1 ⚠️

- [ ] T005 [P] [US1] Create integration tests for options CRUD endpoints in `backend/tests/api/test_options_api.py`
- [ ] T006 [P] [US1] Create component tests for options editor UI in `frontend/src/components/admin/PicklistOptionsEditor.test.tsx`

### Implementation for User Story 1

- [ ] T007 [US1] Implement `POST /api/meta/fields/{id}/options` endpoint with name format validation in `backend/app/api/endpoints/metadata.py`
- [ ] T008 [US1] Implement `PATCH /api/meta/fields/{id}/options/{name}` endpoint with name format validation in `backend/app/api/endpoints/metadata.py`
- [ ] T009 [US1] Implement `DELETE /api/meta/fields/{id}/options/{name}` with migration logic in `backend/app/api/endpoints/metadata.py`
- [ ] T010 [P] [US1] Create `PicklistOptionsEditor` component with drag-and-drop or button-based ordering in `frontend/src/components/admin/PicklistOptionsEditor.tsx`
- [ ] T011 [US1] Integrate `PicklistOptionsEditor` into `FieldCreateDialog.tsx` in `frontend/src/components/admin/FieldCreateDialog.tsx`
- [ ] T012 [US1] Implement real-time saving logic for options in `frontend/src/services/metaApi.ts`

**Checkpoint**: At this point, User Story 1 is fully functional. Admin can manage Picklist options.

---

## Phase 4: User Story 2 - 用户在运行时应用中使用 Picklist 字段 (Priority: P1)

**Goal**: 用户在创建/编辑记录时，能通过带搜索功能的下拉框（Autocomplete）选择选项，展示 Label，保存 Name。

**Independent Test**: 打开 Account 创建表单，在性别字段输入“男”，应匹配到选项并选中。保存后，通过数据库查询确认存储的值是 "male"。

### Tests for User Story 2 ⚠️

- [ ] T013 [P] [US2] Create component tests for Picklist field in `frontend/src/components/dynamic/PicklistField.test.tsx`
- [ ] T014 [P] [US2] Create integration test for record creation with Picklist in `backend/tests/api/test_data_picklist.py`

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create `PicklistField` component using MUI Autocomplete in `frontend/src/components/dynamic/PicklistField.tsx`
- [ ] T016 [US2] Integrate `PicklistField` into `DynamicForm.tsx` to handle Picklist type in `frontend/src/components/dynamic/DynamicForm.tsx`
- [ ] T017 [US2] Update `dataApi.ts` to ensure Picklist values are handled correctly in `frontend/src/services/dataApi.ts`

**Checkpoint**: At this point, User Stories 1 and 2 are functional. Users can now input Picklist data.

---

## Phase 5: User Story 3 - Picklist 数据展示与校验 (Priority: P2)

**Goal**: 在列表和详情页展示 Label；后端强制校验提交的值是否在预定义选项内。

**Independent Test**: 1. 查看记录详情确认显示为“男”。2. 使用 Postman 提交 `sex: "alien"`，确认后端返回 400 错误。

### Tests for User Story 3 ⚠️

- [ ] T018 [P] [US3] Create validation tests for Picklist in `backend/tests/unit/test_data_service_validation.py`
- [ ] T019 [P] [US3] Create UI tests for Name-to-Label mapping in `frontend/src/components/data/DataDisplay.test.tsx`

### Implementation for User Story 3

- [ ] T020 [US3] Implement range validation for Picklist fields in `backend/app/services/data_service.py`
- [ ] T021 [P] [US3] Create `getOptionLabel` utility function in `frontend/src/utils/metadata.ts`
- [ ] T022 [US3] Update `DynamicDataGrid.tsx` to display labels for Picklist columns in `frontend/src/components/data/DynamicDataGrid.tsx`
- [ ] T023 [US3] Update Record Detail view to display labels in `frontend/src/components/data/RecordDetail.tsx`
- [ ] T024 [US3] Add `sex` picklist field and options to `Account` object in `db/seed/meta.yml`
- [ ] T025 [US3] Update existing test data to include `sex` values in `db/seed/record-account.yml`

**Checkpoint**: All user stories are functional and data integrity is guaranteed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T026 [P] Update project documentation (README/GEMINI.md) in Chinese
- [ ] T027 Code cleanup and refactor redundant mapping logic
- [ ] T028 UX review: Ensure Autocomplete clearable behavior matches FR-009
- [ ] T029 Security check: Ensure Name character validation (FR-012) is enforced on backend
- [ ] T030 Run `quickstart.md` validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3-5)**: All depend on Foundational completion.
  - US1 (Phase 3) is the prerequisite for meaningful usage of US2 and US3.
- **Polish (Phase 6)**: Depends on all stories completion.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- US1, US2, US3 implementation can theoretically start in parallel once foundation is ready, but US1 is P1 MVP.
- All tasks marked [P] can run in parallel with other [P] tasks in the same phase.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Setup + Foundational.
2. Complete US1 (Admin defining options) - This allows creating the test case.
3. Complete US2 (Runtime usage) - This completes the core loop.
4. **STOP and VALIDATE**.

### Incremental Delivery

1. US1 + US2 -> Core functional increment.
2. US3 -> Quality and Data Integrity increment.
3. Polish -> Final release quality.
