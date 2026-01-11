<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: 迁移 DataTable 至 MUI DataGrid

**Feature Branch**: `004-migrate-to-datagrid`  
**Created**: 2026-01-11  
**Status**: Draft  
**Input**: User description: "迁移当前实现中的 DataTable 到 MUI 的 DataGrid"

## Clarifications

### Session 2026-01-11
- Q: 用户提出暂时不需要实现筛选和排序功能，是否应明确禁用这些默认特性？ → A: Explicitly disable sorting and filtering props in the DataGrid component.
- Q: What specific page size options should be available in the pagination control? → A: 10, 25, 50
- Q: 迁移完成后是否需要删除掉旧的 DataTable 实现？ → A: Yes, delete it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看对象记录列表 (Priority: P1)

作为 Runtime App 的最终用户，我希望在对象列表页看到以现代化数据表格展示的记录，以便于浏览业务数据。

**Why this priority**: 核心基础功能，替换现有的简易表格组件。

**Independent Test**: 访问任意对象的列表页 (如 Account)，应能看到数据表格正常渲染，且包含预期的列和数据。

**Acceptance Scenarios**:

1. **Given** 存在 Account 对象和多条记录, **When** 用户进入 Account 列表页, **Then** 页面应显示 MUI DataGrid 组件，列出所有 Account 记录。
2. **Given** 记录中包含不同类型的字段 (文本、数字), **When** 页面加载, **Then** 表格应正确格式化显示这些字段的值。

---

### User Story 2 - 记录操作 (Priority: P1)

作为 Runtime App 的最终用户，我希望能在表格行上直接进行编辑或删除操作，以便于维护数据。

**Why this priority**: 保证业务流程闭环，不丢失原有功能。

**Independent Test**: 在表格中点击“编辑”或“删除”按钮，应触发相应的页面跳转或确认对话框。

**Acceptance Scenarios**:

1. **Given** 列表页显示记录, **When** 用户点击某行的“编辑”图标, **Then** 应跳转到该记录的编辑页面。
2. **Given** 列表页显示记录, **When** 用户点击某行的“删除”图标, **Then** 应弹出确认框，确认后删除该记录并刷新列表。

---

### User Story 3 - 数据交互 (分页) (Priority: P2)

作为 Runtime App 的最终用户，我希望能对表格数据进行分页浏览，以便在数据量较大时保持界面整洁。

**Why this priority**: DataGrid 带来的核心体验提升，支持处理更大数据集。

**Independent Test**: 当数据量超过单页限制时，底部出现分页控件并能切换页码。

**Acceptance Scenarios**:

1. **Given** 数据量超过一页默认显示数量 (如 10 条), **When** 页面加载, **Then** 表格底部应显示分页控件，并允许用户翻页。
2. **Given** 表格加载完成, **When** 用户尝试点击表头排序或打开筛选菜单, **Then** 这些交互应被禁用或不可见。

### Edge Cases

- **空数据状态**: 当对象没有任何记录时，表格应显示“暂无数据”或其他友好的空状态提示，而不是空白或报错。
- **网络错误**: 当加载数据请求失败时，应在列表区域显示错误提示，并提供重试按钮。
- **大量数据**: 当数据量达到 1000+ 条时，前端渲染不应卡顿，分页控件应正确计算页数。
- **超长文本**: 当某个字段内容过长时，表格单元格应截断显示 (Ellipsis) 并提供 Tooltip 或自动换行，保持表格布局整洁。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 前端项目必须集成 `@mui/x-data-grid` 组件库。
- **FR-002**: 运行时应用的“对象记录列表页”必须使用 MUI `DataGrid` 组件替换原有的简易表格实现。
- **FR-003**: 系统必须根据元数据 (MetaField) 动态生成 DataGrid 的列定义 (GridColDef)，支持 Text, Number, Date, Boolean 等基础类型。
- **FR-004**: 表格必须包含一个“操作”列，提供 Edit (编辑) 和 Delete (删除) 按钮，保持原有业务逻辑不变。
- **FR-005**: 系统必须启用 DataGrid 的客户端分页功能，默认每页显示 10/25/50 条记录。
- **FR-006**: 系统必须显式禁用 DataGrid 的排序 (Sorting) 功能 (`disableColumnSorting={true}`)。
- **FR-007**: 系统必须显式禁用 DataGrid 的列筛选 (Filtering) 功能 (`disableColumnFilter={true}`)。
- **FR-008**: 对于 Boolean 类型字段，表格应渲染为易读的格式 (如 Checkbox 或 Yes/No 文本)，而非 true/false 字符串。
- **FR-009**: 如果数据加载为空，表格应显示友好的空状态提示。
- **FR-010**: 在确认迁移成功且无其他页面依赖后，必须删除旧的 `frontend/src/components/data/DataTable.tsx` 实现及其相关引用。

### Non-Functional Requirements

- **PERF-001**: 即使在加载 1000 条记录时，表格滚动和交互应保持流畅 (利用 DataGrid 虚拟滚动特性)。
- **UX-001**: 表格样式应与现有 Material UI 主题保持一致 (颜色、间距)。

### UX/UI Consistency

- **UX-002**: 操作列的图标按钮样式应与系统中其他位置保持一致。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 运行时应用的所有记录列表页面均采用新的 DataGrid 组件渲染，旧组件不再被该页面使用。
- **SC-002**: 分页功能正常工作：当记录数超过 10 条时，分页控件自动出现，且提供 10, 25, 50 条每页的选项，用户可以成功切换页码。
- **SC-003**: 排序和筛选功能已被禁用，用户无法通过点击表头或菜单触发这些操作。
- **SC-004**: 用户通过操作列删除记录后，表格应立即移除该行数据，且无需手动刷新页面。
- **SC-005**: 旧的 `DataTable.tsx` 文件已从代码库中移除，且无编译错误或未使用的导入。
