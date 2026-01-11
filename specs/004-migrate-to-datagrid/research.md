# Research: 迁移 DataTable 至 MUI DataGrid

**Feature**: 004-migrate-to-datagrid
**Date**: 2026-01-11

## 1. 禁用排序和筛选

**Decision**: 在 `DataGrid` 组件上使用全局属性禁用。
**Rationale**: 满足用户明确提出的“暂时不需要排序和筛选”的需求，同时减少 UI 复杂度。
**Implementation**:
```tsx
<DataGrid
  // ...
  disableColumnSorting={true}
  disableColumnFilter={true}
  // ...
/>
```

## 2. 动态列生成

**Decision**: 根据 `MetaField` 元数据在运行时映射生成 `GridColDef` 数组，并使用 `useMemo` 进行优化。
**Rationale**: 系统是元数据驱动的，列定义存储在后端数据库中，前端必须动态生成。使用 `useMemo` 防止因父组件重渲染导致表格状态丢失。
**Implementation**:
```tsx
const columns = useMemo(() => {
  return fields.map(field => ({
    field: field.name,
    headerName: field.label,
    flex: 1, // 自适应宽度
    // 类型映射逻辑...
  }));
}, [fields]);
```

## 3. 分页配置

**Decision**: 使用客户端分页，配置每页显示 10, 25, 50 条。
**Rationale**: 数据量主要在 1000 条以内，客户端分页响应最快，且无需后端 API 变动。
**Implementation**:
```tsx
<DataGrid
  pagination
  pageSizeOptions={[10, 25, 50]}
  initialState={{
    pagination: {
      paginationModel: { pageSize: 10 },
    },
  }}
/>
```

## 4. 样式定制

**Decision**: 使用 `sx` 属性覆盖 DataGrid 默认样式，使其贴合现有的 Material Design 主题。
**Rationale**: DataGrid 默认样式可能带有较重的边框，通过 `sx` 可以轻松去除去除边框、调整表头背景色，保持与旧表格视觉一致。
**Implementation**:
```tsx
<DataGrid
  sx={{
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f5f5f5', // 示例背景色
    },
  }}
/>
```
