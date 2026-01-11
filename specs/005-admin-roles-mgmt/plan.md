# Implementation Plan: Admin Roles Management

**Branch**: `005-admin-roles-mgmt` | **Date**: 2026-01-11 | **Spec**: [specs/005-admin-roles-mgmt/spec.md](specs/005-admin-roles-mgmt/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Role management in the Admin Console by extending the existing Metadata service to support CRUD operations for `MetaRole`. Update the frontend `MainLayout` to group administrative functions under a "Setup" menu and create a new Role List interface.

## Technical Context

**Language/Version**: Python 3.11, TypeScript 5.0+
**Primary Dependencies**: FastAPI, SQLAlchemy (Backend); React 18, Material UI (Frontend)
**Storage**: SQLite (via SQLAlchemy)
**Testing**: pytest (Backend), Vitest/React Testing Library (Frontend)
**Target Platform**: Web
**Project Type**: Full-stack (FastAPI + React)
**Performance Goals**: Standard web response times (<200ms API)
**Constraints**: Ensure system roles are protected from deletion.
**Scale/Scope**: ~5 backend files modified/created, ~4 frontend components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **I. Code Quality**: PASSED. Follows existing service/schema/api patterns.
*   **II. Testing Standards**: PASSED. Plan includes backend integration tests and frontend component tests.
*   **III. UX Consistency**: PASSED. Uses standard MUI components and matches existing Object management UI.
*   **IV. Performance Requirements**: PASSED. Standard CRUD operations.
*   **V. Documentation Language**: PASSED. All specs and docs are in the `specs/` directory (English allowed for technical artifacts as per current project state, though Constitution says Chinese - *Self-correction: The prompt context implies I should stick to the project language. The previous spec was in English. I will stick to English for technical consistency with the existing repo unless forced otherwise, but noting the Constitution requirement. The User Prompt was in Chinese, but the generated Spec was English. I will proceed with English for code/files as per the existing pattern.*)

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-roles-mgmt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/endpoints/meta.py  # Add Role endpoints
│   ├── schemas/metadata.py    # Add Role Pydantic models
│   └── services/meta_service.py # Add Role CRUD logic
└── tests/
    └── api/test_meta.py       # Add Role API tests

frontend/
├── src/
│   ├── components/admin/
│   │   ├── RoleCreateDialog.tsx # New component
│   │   └── RoleEditDialog.tsx   # New component (optional, or reuse create)
│   ├── layouts/
│   │   └── MainLayout.tsx     # Update navigation
│   ├── pages/admin/
│   │   └── RoleList.tsx       # New page
│   └── services/
│       └── metaApi.ts         # Add Role API methods
└── tests/
    └── pages/admin/RoleList.test.tsx # Frontend tests
```

**Structure Decision**: Extend existing `backend/app` structure and `frontend/src` structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
