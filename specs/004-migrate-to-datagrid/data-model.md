# Data Model: 迁移 DataTable 至 MUI DataGrid

**Feature**: 004-migrate-to-datagrid
**Status**: Frontend Only (Consumes existing Metadata)

## Frontend Interfaces

### DynamicDataGridProps
定义了新的通用 DataGrid 组件的属性接口。

```typescript
interface DynamicDataGridProps {
  /**
   * 元数据字段定义列表，用于生成表格列
   */
  fields: MetaField[];
  
  /**
   * 表格显示的数据行
   */
  rows: any[];
  
  /**
   * 是否正在加载数据
   */
  loading?: boolean;
  
  /**
   * 点击行时的回调函数
   */
  onRowClick?: (row: any) => void;
  
  /**
   * 自定义操作列的渲染函数
   */
  actions?: (row: any) => React.ReactNode;
}
```

### Metadata Mapping
前端将现有的 `MetaField` 类型映射到 MUI DataGrid 的 `GridColDef`。

| MetaField Type | GridColDef Type | Formatting Note |
| :--- | :--- | :--- |
| Text | string | 直接显示 |
| Number | number | 直接显示 |
| Boolean | boolean | 渲染为 Checkbox (read-only) 或 "Yes/No" 文本 (根据 FR-008) |
| Date | date / dateTime | 格式化为本地日期字符串 |
| Lookup | string | 显示 lookup 对象的 label (如果数据中包含) 或 ID |

## Database Schema
*No changes. This feature uses existing tables (`meta_objects`, `meta_fields`, and dynamic object tables).*
