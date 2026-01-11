<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Implementation Plan: 迁移 DataTable 至 MUI DataGrid

**Branch**: `004-migrate-to-datagrid` | **Date**: 2026-01-11 | **Spec**: [specs/004-migrate-to-datagrid/spec.md](spec.md)
**Input**: Feature specification from `/specs/004-migrate-to-datagrid/spec.md`

## Summary

本功能旨在将 Runtime App 中的自定义 `DataTable` 组件迁移至 Material UI 的 `DataGrid` 组件。主要目标是提升大量数据下的渲染性能（通过虚拟滚动），并提供标准化的分页体验。根据用户需求，排序和筛选功能将被显式禁用。实现将涉及引入 `@mui/x-data-grid` 库，并根据后端元数据动态生成列配置。**迁移完成后，旧的 `DataTable` 组件及其引用将被彻底删除。**

## Technical Context

**Language/Version**: TypeScript 5.0+, React 18.2+
**Primary Dependencies**: `@mui/x-data-grid` (New), `@mui/material` (Existing)
**Storage**: N/A (Frontend display only)
**Testing**: `vitest`, `@testing-library/react`
**Target Platform**: Web Browser (Modern)
**Project Type**: Web Application (Frontend)
**Performance Goals**: 支持 1000+ 条记录流畅滚动，页面加载无明显卡顿。
**Constraints**: 必须禁用排序和筛选；保持现有的 Material Design 主题风格。
**Scale/Scope**: 替换 `ObjectRecordList.tsx` 中的表格实现并删除旧代码。

## Constitution Check

*   **I. Code Quality**: 使用成熟的第三方组件库 (`DataGrid`) 替代手写表格，减少了维护成本。删除废弃代码进一步降低了技术债务，符合代码质量原则。
*   **II. Testing Standards**: 将编写针对 DataGrid 集成的组件测试，覆盖列渲染、数据展示和分页逻辑。
*   **III. UX Consistency**: DataGrid 是 MUI 官方组件，与现有的 MUI 组件库视觉风格高度一致，提升 UX 一致性。
*   **IV. Performance Requirements**: DataGrid 内置虚拟滚动，直接解决了大数据量下的渲染性能问题。
*   **V. Documentation Language**: 确认所有文档（包括此计划和后续的 `quickstart.md`）均使用中文编写。

## Project Structure

### Documentation (this feature)

```text
specs/004-migrate-to-datagrid/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI/GraphQL specs if needed)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── data/
│   │       ├── DynamicDataGrid.tsx  # [New] Wrapper component for DataGrid
│   │       └── DataTable.tsx        # [DELETE] Legacy component
│   └── pages/
│       └── runtime/
│           └── ObjectRecordList.tsx # [Modified] Use DynamicDataGrid instead of DataTable
└── tests/
    └── components/
        └── DynamicDataGrid.test.tsx # [New] Tests for the new wrapper
```

**Structure Decision**: 采用 Wrapper 组件模式 (`DynamicDataGrid`)，封装 DataGrid 的配置（如禁用排序/筛选、默认分页设置），以便于在多处复用并保持配置统一。确认删除不再使用的 `DataTable.tsx`。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |