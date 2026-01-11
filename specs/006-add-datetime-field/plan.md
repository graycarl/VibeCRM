# Implementation Plan: Add Datetime Field & System Timestamp

**Branch**: `006-add-datetime-field` | **Date**: 2026-01-11 | **Spec**: [specs/006-add-datetime-field/spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-add-datetime-field/spec.md`

## Summary

Implement `Datetime` field type support in the Metadata engine, including SQLite `TEXT` mapping (ISO8601). Add standard `created_at` and `updated_at` timestamp fields to `User` and `Account` system objects (and future standard for all objects). Update Frontend `DynamicForm` to render `datetime-local` inputs (handling UTC-Local conversion) and enforce read-only state for system timestamps in edit mode. Ensure Backend API automatically sets timestamps on creation/update and protects them from client modification.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript 5.0+ (Frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy (Backend); React, MUI (Frontend)
**Storage**: SQLite (Mapped via `SchemaService`)
**Testing**: pytest (Backend), vitest/jest (Frontend)
**Target Platform**: Web
**Project Type**: Full-stack (Metadata Platform)
**Performance Goals**: Negligible impact on write performance; correct timezone rendering.

## Constitution Check

*   **I. Code Quality**: Adheres to existing `SchemaService` and `DynamicForm` patterns.
*   **II. Testing Standards**: Includes independent tests for new field type and system object behavior.
*   **III. UX Consistency**: Uses native `datetime-local` for consistency and lightweight implementation; follows established "disabled" state for read-only fields.
*   **IV. Performance Requirements**: Standard column addition; no heavy indexing planned for now.
*   **V. Documentation Language**: All user-facing docs in spec are compliant.

## Project Structure

### Documentation (this feature)

```text
specs/006-add-datetime-field/
├── plan.md              # This file
├── research.md          # Implementation details & decisions
├── data-model.md        # Schema definitions
├── quickstart.md        # Verification guide
└── contracts/           # (No new endpoints, schema updates only)
```

### Source Code

```text
backend/
├── app/
│   ├── models/metadata.py          # (No change needed if String type used)
│   ├── services/schema_service.py  # Add Datetime -> TEXT mapping
│   ├── services/data_service.py    # Inject created_at/updated_at logic
│   └── schemas/                    # Update Pydantic models (read-only logic)
└── db/seed/meta.yml                # Add created_at/updated_at to User/Account

frontend/
├── src/
│   ├── components/dynamic/
│   │   └── DynamicForm.tsx         # Add Datetime case & ReadOnly logic
│   └── services/metaApi.ts         # Update TS types
```

## Phases

### Phase 1: Backend Implementation
- **Goal**: Support Datetime storage and auto-timestamping.
- **Steps**:
  1.  Update `SchemaService.add_column` to map `Datetime` -> `TEXT`.
  2.  Update `DataService.create_record` to inject `created_at` and `updated_at` (UTC ISO).
  3.  Update `DataService.update_record` to inject `updated_at` (UTC ISO) and exclude timestamp inputs.
  4.  Update `db/seed/meta.yml` to include `created_at` and `updated_at` for `user` and `account`.
  5.  *Migration*: Re-init DB to apply seeds.

### Phase 2: Frontend Implementation
- **Goal**: Visualize and Edit Datetime fields.
- **Steps**:
  1.  Update `MetaField` type definition.
  2.  Update `DynamicForm` to handle `Datetime` type:
      - Render `<TextField type="datetime-local">`.
      - Value Prop: Convert UTC string -> `YYYY-MM-DDThh:mm`.
      - OnChange: Convert `YYYY-MM-DDThh:mm` -> UTC string.
  3.  Implement `disabled` state for `created_at` and `updated_at` fields in `DynamicForm`.

### Phase 3: Verification
- **Goal**: End-to-end test.
- **Steps**:
  1.  Run `quickstart.md` validation steps (Create, Update, Verify timestamps).
  2.  Add unit test for `SchemaService` mapping.
  3.  Add unit test for `DataService` timestamp injection.