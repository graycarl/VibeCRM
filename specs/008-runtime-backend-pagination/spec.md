<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: Runtime App 后端分页逻辑

**Feature Branch**: `008-runtime-backend-pagination`  
**Created**: 2026-01-13  
**Status**: Draft  
**Input**: User description: "为 Runtime App 的 Page List 实现完整的后端分页逻辑"

## Clarifications

### Session 2026-01-13

- Q: 启用后端分页后，是否需要同时实现或启用列排序（Sorting）功能？ → A: 保持禁用。继续在界面中禁用列排序，本次仅关注分页逻辑。
- Q: 当用户更改每页显示数量（Page Size）时，应如何处理当前页码？ → A: 重置回第一页 (Page 1)，这是最安全的标准行为。
- Q: 后端 API 返回分页数据时，应采用何种数据格式？ → A: 使用 Pydantic Schema (Response Model)。定义标准的分页响应模型以确保类型安全和文档清晰。
- Q: 若后端因元数据配置错误等原因无法统计总数或获取数据，应如何响应？ → A: 返回错误响应 (Error Response)。返回 500 等错误状态，由前端 UI 统一处理错误状态。
- Q: 前端向后端传递分页参数（skip/limit）时，应采用何种方式？ → A: URL 查询参数 (Query Parameters)。采用标准的 URL query params 方式传递。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 浏览并翻页查看大量数据 (Priority: P1)

用户需要查看超过默认单页数量（如 50 条）的对象记录列表，以便访问整个数据集。

**Why this priority**: 目前系统只加载前 50 条数据，导致用户无法访问后续数据，严重影响业务可用性。

**Independent Test**:
1.  生成超过 50 条（例如 55 条）的测试数据。
2.  在 Runtime App 列表页查看，应显示分页控件，指示总记录数。
3.  点击“下一页”，应加载第 51-55 条记录。

**Acceptance Scenarios**:

1.  **Given** 数据库中某对象有 100 条记录, **When** 用户打开该对象的列表页, **Then** 列表显示第 1-50 条记录，且分页组件显示“1-50 of 100”。
2.  **Given** 用户在第 1 页, **When** 用户点击分页组件的“下一页”按钮, **Then** 列表刷新，显示第 51-100 条记录。
3.  **Given** 用户在第 2 页, **When** 用户点击“上一页”按钮, **Then** 列表刷新，重新显示第 1-50 条记录。

---

### User Story 2 - 调整每页显示数量 (Priority: P2)

用户希望改变每页显示的记录数量（例如从 50 改为 10 或 25），以便根据屏幕大小或浏览习惯调整视图。

**Why this priority**: 提供更好的用户体验和灵活性。

**Independent Test**: 在列表页更改分页下拉框的选项（如 10条/页），列表应立即刷新并显示相应数量的记录。

**Acceptance Scenarios**:

1.  **Given** 当前每页显示 50 条记录, **When** 用户在分页控件中选择“10条/页”, **Then** 列表刷新，只显示前 10 条记录，且分页组件显示“1-10 of [Total]”。

### Edge Cases

- **数据为空**: 列表应显示 "No rows" 或类似空状态，分页显示 "0-0 of 0"。
- **最后一页数据不足一页**: 例如总数 55，每页 50，第 2 页应只显示 5 条，且无“下一页”选项。
- **并发删除**: 当用户在第 2 页时，其他用户删除了第 1 页的数据导致总页数减少，刷新后应妥善处理（如保持在第 2 页但这页可能变空，或自动跳回有效页）。本阶段暂不需处理复杂的并发跳页，只需保证不报错。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统后端接口必须支持返回包含“记录总数”和“当前页数据列表”的结构化响应，而不仅仅是数据列表。
- **FR-002**: 系统的列表视图必须维护用户的分页状态（当前页码、每页显示条数）。
- **FR-003**: 列表视图必须采用服务端分页模式，即仅加载当前页面所需的数据，而不是一次性加载所有数据。
- **FR-004**: 当用户切换页码或改变每页条数时，系统必须向后端发起请求以获取对应的数据子集。
- **FR-005**: 分页控件必须正确显示当前数据范围和总记录数（例如 "1-50 of 200"）。
- **FR-006**: 系统默认每页显示 50 条记录，并提供如 10, 25, 50 等多种每页数量选项供用户选择。

### Non-Functional Requirements

- **PERF-001**: 获取分页数据的 API 响应时间在数据量达到 10,000 条级别时应保持在 500ms 以内（依赖数据库索引）。
- **UX-001**: 翻页加载过程中，表格应显示加载状态 (`loading` indicator)，防止用户重复点击。

### Key Entities *(include if feature involves data)*

- **PaginatedResponse**: API 响应的标准结构，包含 `items` (List[Record]) 和 `total` (Integer)。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以成功访问系统中的第 51+ 条记录（如果存在）。
- **SC-002**: 在 1000 条数据量的测试环境下，翻页操作的端到端延迟（从点击到数据显示）不超过 1 秒。
- **SC-003**: 前端分页组件显示的“总记录数”与数据库实际记录数完全一致。