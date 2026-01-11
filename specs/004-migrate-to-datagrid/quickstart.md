# Quickstart: DynamicDataGrid 组件

**Feature**: 004-migrate-to-datagrid
**Language**: TypeScript / React

## 简介

`DynamicDataGrid` 是基于 `@mui/x-data-grid` 封装的通用数据表格组件。它专门设计用于根据 VibeCRM 的元数据 (`MetaField`) 自动生成列，并提供标准化的样式、分页和交互行为。

## 安装依赖

在使用前，请确保已安装必要的 MUI X 依赖：

```bash
cd frontend
npm install @mui/x-data-grid
```

## 基本用法

在页面中引入并传递 `fields` 和 `rows` 即可：

```tsx
import DynamicDataGrid from '../../components/data/DynamicDataGrid';
import { MetaField } from '../../services/metaApi';

// 示例数据
const fields: MetaField[] = [
  { name: 'name', label: 'Account Name', type: 'Text' },
  { name: 'revenue', label: 'Annual Revenue', type: 'Number' }
];

const rows = [
  { uid: '1', name: 'Acme Corp', revenue: 1000000 },
  { uid: '2', name: 'Global Inc', revenue: 500000 }
];

function AccountList() {
  return (
    <DynamicDataGrid
      fields={fields}
      rows={rows}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
}
```

## 配置操作列

通过 `actions` 属性自定义每一行的操作按钮：

```tsx
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

<DynamicDataGrid
  fields={fields}
  rows={rows}
  actions={(row) => (
    <IconButton onClick={() => handleEdit(row)}>
      <EditIcon />
    </IconButton>
  )}
/>
```

## 功能特性

- **自动列生成**: 根据 `MetaField` 类型自动配置列宽和格式化。
- **分页**: 默认开启，每页 10/25/50 条。
- **虚拟滚动**: 支持千级数据流畅渲染。
- **禁用排序/筛选**: 根据当前设计规范，排序和筛选功能默认已禁用。
