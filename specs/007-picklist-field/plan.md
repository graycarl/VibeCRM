# Implementation Plan: 完善 Picklist 类型字段实现

## Technical Context

- **Backend Stack**: FastAPI, SQLAlchemy (SQLite), Python 3.11.
- **Frontend Stack**: React 18, TypeScript, Material UI 5.
- **Current Metadata Model**: `MetaField` contains an `options` JSON field.
- **Picklist Storage**: Selected values are stored as `TEXT` in dynamic data tables.
- **UI Components**: 
  - Admin: `FieldCreateDialog.tsx` needs Picklist options UI.
  - Runtime: `DynamicForm.tsx` needs `Autocomplete` for Picklist fields.
- **Data Validation**: `DataService.py` needs to validate Picklist values against `MetaField.options`.

## Constitution Check

- **I. Code Quality**: 遵循现有 `DataService` 和 `DynamicForm` 的模式，保持代码整洁和类型安全。
- **II. Testing Standards**: 
  - 后端：测试 `DataService` 的校验逻辑。
  - 前端：测试 `DynamicForm` 中 Picklist 的渲染和 Name-to-Label 映射。
- **III. User Experience (UX) Consistency**: 使用 MUI `Autocomplete` 确保与系统 UI 风格一致。
- **IV. Performance Requirements**: 前端 Name-to-Label 映射在内存中处理，确保 DataGrid 渲染效率。
- **V. Documentation Language**: 所有文档使用中文。

## Gates

- [x] Feature Spec 完整且无歧义。
- [x] 确定了 `MetaField.options` 的存储结构 `[{"name": "...", "label": "..."}]`。
- [x] 确定了实时保存选项的机制。
- [x] 确定了删除选项时的强制迁移逻辑。

## Phase 0: Research & Decision Log

*详见 `research.md`*

- **Decision 1**: 使用 `MUI Autocomplete` 替代标准的 `Select`。
  - **Rationale**: 支持搜索功能，提升选项较多时的用户体验（FR-011）。
- **Decision 2**: 在 `DataService` 层进行范围校验。
  - **Rationale**: 确保数据完整性，不依赖前端限制（SEC-001）。
- **Decision 3**: 在 `MetaService` 中增加选项更新/删除接口。
  - **Rationale**: 支持实时保存机制（FR-013）和删除时的迁移逻辑。

## Phase 1: Design & Contracts

- **Data Model**: 更新 `MetaField` 的使用文档，明确 `options` 结构。详见 `data-model.md`。
- **API Contracts**: 
  - `POST /api/meta/fields/{id}/options`: 添加选项。
  - `PATCH /api/meta/fields/{id}/options/{name}`: 更新选项。
  - `DELETE /api/meta/fields/{id}/options/{name}`: 删除选项（含迁移参数）。
- **Quickstart**: 提供如何创建 Picklist 字段并验证功能的快速指南。

## Phase 2: Implementation Sequence

1. **Backend Foundation**:
   - 更新 `MetaService` 处理选项增删改查及校验。
   - 实现 `DataService` 中的 Picklist 值合法性校验。
2. **Admin Console UI**:
   - 在 `FieldCreateDialog` 中添加 Picklist 选项编辑器。
   - 实现实时保存接口调用。
3. **Runtime App UI**:
   - 更新 `DynamicForm` 集成 `Autocomplete` 组件。
   - 实现列表页和详情页的 Name-to-Label 转换器。
4. **Seed Data**:
   - 更新 `Account` 对象的 seed 配置。