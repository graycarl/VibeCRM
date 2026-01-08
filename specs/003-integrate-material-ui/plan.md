# Implementation Plan: Integrate Material UI (Extended)

**Branch**: `003-integrate-material-ui` | **Date**: 2026-01-09 | **Spec**: [specs/003-integrate-material-ui/spec.md](../specs/003-integrate-material-ui/spec.md)

## Summary

In addition to the basic setup, this plan covers the complete migration of all existing frontend pages to Material UI, implementation of zhCN localization, and establishment of a shared component library (e.g., `DataTable`) to ensure UX consistency and clean code architecture.

## Technical Context

**Language/Version**: TypeScript 5.0+, React 18.2+
**Primary Dependencies**: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `@fontsource/roboto`
**Localization**: MUI `zhCN` locale.
**Key Architectural Decisions**:
- **Shared Components**: Encapsulate common patterns into reusable components (e.g., `DataTable`, `LoadingState`).
- **Incremental Cleanup**: Delete associated `.css` files immediately after each page refactor.
- **Feedback Standards**: Use `Skeleton` for initial loads and `CircularProgress` for action feedback.

## Project Structure

### Documentation
(Unchanged from initial plan)

### Source Code
```text
frontend/
├── src/
│   ├── theme/           # Theme & Localization
│   │   └── index.ts
│   ├── components/      # Shared business components (Encapsulated)
│   │   ├── common/      # Feedback, Error handling
│   │   └── data/        # DataTable
│   ├── layouts/         # App layouts (MainLayout)
│   ├── pages/           # Refactored pages (MUI only)
│   ├── App.tsx
│   └── main.tsx
└── tests/
```

## Migration Strategy

1. **Foundational Components**: Build `DataTable` and feedback components first.
2. **Sequential Refactor**:
   - **Phase 1**: Login & Auth pages.
   - **Phase 2**: Admin console (Object lists, details, editors).
   - **Phase 3**: Runtime App (Record lists, detail views, forms).
3. **Atomic Commit**: Each page refactor should include:
   - Conversion to MUI components.
   - Removal of old CSS files.
   - Verification of responsive behavior.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |
