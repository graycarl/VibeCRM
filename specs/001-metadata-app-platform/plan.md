# Implementation Plan: 元数据驱动应用开发平台

**Branch**: `001-metadata-app-platform` | **Date**: 2026-01-07 | **Spec**: [specs/001-metadata-app-platform/spec.md](spec.md)
**Input**: Feature specification from `specs/001-metadata-app-platform/spec.md`

## Summary

构建一个类似 Salesforce 的元数据驱动应用开发平台。包含两个核心部分：
1.  **Admin Console**: 允许管理员定义 Custom Objects、Fields、Relationships、Page Layouts 和 List Views。所有元数据变更同步执行数据库 DDL。
2.  **Runtime App**: 根据元数据动态渲染前端 UI（列表、详情、编辑页），并提供通用的 CRUD API 处理业务数据。

**核心技术**:
-   **Backend**: Python 3.11 + FastAPI + SQLAlchemy (Sync/Core) + SQLite.
-   **Frontend**: React 18 + TypeScript + MUI + React Hook Form (Dynamic Rendering).
-   **Data Model**: Metadata Tables (ORM) + Dynamic Data Tables (Table-Per-Object).

## Technical Context

**Language/Version**: Python 3.11+, TypeScript 5.0+
**Primary Dependencies**: FastAPI, SQLAlchemy (Sync), React 18, MUI, React Hook Form
**Storage**: SQLite (Local file DB)
**Testing**: pytest (Backend), Vitest/Jest (Frontend)
**Target Platform**: Web Application (Browser)
**Project Type**: Full-stack Web (Frontend + Backend)
**Performance Goals**: List view load < 1s (50 records), Schema updates (DDL) are synchronous and atomic.
**Constraints**: Local execution (SQLite), Table-Per-Object strategy.
**Scale/Scope**: MVP supports defined data types, basic relationships (Lookup), and basic layout configuration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **I. Code Quality**: Yes. Separation of concerns between Metadata engine and Runtime engine. Strict typing with Pydantic and TypeScript.
*   **II. Testing Standards**: Yes. Acceptance scenarios defined in Spec. Independent tests for metadata definition and runtime rendering.
*   **III. UX Consistency**: Yes. Using MUI for consistent component design. Admin and User portals share design language.
*   **IV. Performance Requirements**: Yes. Explicit goals defined in Spec (SC-004) and Technical Context.
*   **V. Documentation Language**: Yes. All documentation (Spec, Research, Plan, Data Model) is in Chinese.

## Project Structure

### Documentation (this feature)

```text
specs/001-metadata-app-platform/
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Database schema & Entity definitions
├── quickstart.md        # Setup guide
├── contracts/           # API Specifications (OpenAPI)
│   └── openapi.yaml
└── checklists/          # Requirements Checklist
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/             # API Routes (Static & Dynamic)
│   ├── core/            # Config, Security
│   ├── db/              # Database connection & Session
│   ├── models/          # SQLAlchemy Models (Metadata tables)
│   ├── services/        # Business Logic (SchemaService, DataService)
│   └── schemas/         # Pydantic Schemas (Static)
├── tests/
│   ├── unit/
│   └── integration/
├── main.py
└── pyproject.toml

frontend/
├── src/
│   ├── components/      # Shared Components (DynamicForm, DataTable)
│   ├── layouts/         # App Shell (Admin vs User)
│   ├── pages/           # Route Pages
│   ├── services/        # API Client
│   ├── types/           # TS Interfaces
│   └── theme/           # MUI Theme
├── tests/
└── package.json
```

**Structure Decision**: Option 2: Web application (Frontend + Backend). Clear separation for the API-driven architecture.