# Tasks: Integrate Material UI (Full Migration)

**Feature**: Integrate Material UI (003-integrate-material-ui)
**Status**: In Progress
**Spec**: [specs/003-integrate-material-ui/spec.md](../specs/003-integrate-material-ui/spec.md)

## Phase 1: Setup & Localization (DONE)

- [x] T001 Install @fontsource/roboto in frontend/package.json
- [x] T002 Ensure core MUI dependencies are installed
- [x] T003 Verify frontend/src/theme/index.ts
- [x] T004 Import Roboto fonts in main.tsx
- [x] T004b Add <CssBaseline /> (FR-002)
- [ ] T015 Configure zhCN localization in frontend/src/main.tsx (FR-010)

## Phase 2: Shared Component Encapsulation (DONE)

Goal: Create reusable components to be used across all pages.

- [x] T016 Create frontend/src/components/common/Feedback.tsx (Skeleton, Alert, Progress)
- [x] T017 Create frontend/src/components/data/DataTable.tsx (Encapsulated MUI Table)

## Phase 3: Auth & Admin Console Migration (DONE)

Goal: Refactor admin-facing pages and clean up CSS.

- [x] T018 Refactor frontend/src/pages/auth/Login.tsx to MUI & Delete associated CSS
- [x] T019 Refactor frontend/src/pages/admin/ObjectList.tsx to MUI & Delete associated CSS
- [x] T020 Refactor frontend/src/pages/admin/ObjectDetail.tsx to MUI & Delete associated CSS
- [x] T021 Refactor frontend/src/pages/admin/ListViewEditor.tsx to MUI & Delete associated CSS
- [x] T022 Refactor frontend/src/pages/admin/PageLayoutEditor.tsx to MUI & Delete associated CSS

## Phase 4: Runtime App Migration (DONE)

Goal: Refactor user-facing record pages and clean up CSS.

- [x] T023 Refactor frontend/src/pages/runtime/ObjectRecordList.tsx to MUI & Delete associated CSS
- [x] T024 Refactor frontend/src/pages/runtime/ObjectRecordDetail.tsx to MUI & Delete associated CSS
- [x] T025 Refactor frontend/src/pages/runtime/ObjectRecordEdit.tsx to MUI & Delete associated CSS

## Phase 5: Verification & Polish (DONE)

- [x] T026 Final global CSS cleanup (remove any remaining non-MUI CSS)
- [x] T027 Verify all pages for responsiveness and localization
- [x] T028 Run full test suite

## Dependencies
- Phase 1 & 2 are prerequisites for Phase 3 & 4.
- Phase 3 and Phase 4 can be worked on sequentially.