# Implementation Plan: 添加开发环境 Makefile

**Branch**: `002-setup-dev-makefile` | **Date**: 2026-01-07 | **Spec**: [link](spec.md)
**Input**: Feature specification from `specs/002-setup-dev-makefile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a root-level `Makefile` to streamline the local development workflow. It provides unified commands for initialization (`make init`), starting services (`make dev`), resetting the database (`make reset`), and running tests (`make test`). The implementation leverages GNU Make's standard capabilities, including parallel execution (`-j`) for running backend and frontend services simultaneously, and ensures a "fail fast" strategy for testing.

## Technical Context

**Language/Version**: Make (GNU Make 3.81+), Python 3.11+ (Backend), Node.js 18+ (Frontend)
**Primary Dependencies**: `uv` (Python pkg manager), `npm` (Node pkg manager), `pytest`
**Storage**: SQLite (via `backend/app/db/init_db.py`)
**Testing**: `pytest` (Backend), `npm run test` (Frontend)
**Target Platform**: macOS (darwin) / Linux
**Project Type**: Full-stack (FastAPI + React)
**Performance Goals**: N/A (Build tool)
**Constraints**: Must execute in project root.
**Scale/Scope**: N/A

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **I. Code Quality**: ✅ The Makefile will use standard conventions, keeping the root directory clean and documenting commands.
*   **II. Testing Standards**: ✅ `make test` unifies the testing interface, enforcing the project's testing standards.
*   **III. UX Consistency**: N/A (CLI Tool)
*   **IV. Performance Requirements**: ✅ `make -j` ensures efficient parallel startup.
*   **V. Documentation Language**: ✅ `quickstart.md` is written in Chinese.

## Project Structure

### Documentation (this feature)

```text
specs/002-setup-dev-makefile/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
Makefile                 # The new makefile
```

**Structure Decision**: Root-level Makefile.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |