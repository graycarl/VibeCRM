# Research: Integrate Material UI

**Feature**: Integrate Material UI (003-integrate-material-ui)
**Date**: 2026-01-09

## Decisions

### 1. Font Loading Strategy
- **Decision**: Use `@fontsource/roboto` via NPM.
- **Rationale**:
  - **Performance**: Self-hosting fonts prevents layout shift (CLS) and avoids external CDN connection overhead.
  - **Reliability**: Works offline and in restricted network environments.
  - **Consistency**: Locks font version to ensure consistent rendering across all developers and CI.
- **Implementation**:
  - `npm install @fontsource/roboto`
  - Import weights 300, 400, 500, 700 in `main.tsx`.

### 2. Theme Architecture
- **Decision**: Centralize theme definition in `frontend/src/theme/index.ts` using `createTheme`.
- **Rationale**:
  - Provides a single source of truth for design tokens (colors, typography, spacing).
  - Enables easy switching to Dark Mode in the future by adding a context provider that swaps the theme object.
- **Implementation**:
  - Keep `theme/index.ts` simple for now (Light mode only as per spec).
  - Ensure `CssBaseline` is used to normalize styles.

### 3. Icon Library
- **Decision**: Use `@mui/icons-material`.
- **Rationale**: Standard companion library for MUI, providing consistent icon set.
- **Status**: Already present in `package.json`.

## Dependencies
- `@mui/material`: Core component library.
- `@emotion/react`, `@emotion/styled`: Styling engine.
- `@mui/icons-material`: SVG Icons.
- `@fontsource/roboto`: Typography.
