# Record Type Support – Requirement Spec

## 背景
VibeCRM 需要支持 Salesforce 风格的 Record Type 概念。每个对象可以启用一个固定的 `record_type` 字段（存储选项 `name`），用于区分对象下不同子类型。字段值来源于独立元数据 `ObjectRecordTypes`，包含 `name / label / description / source`。系统对象遵循严格权限，custom 对象具备配置灵活性。

## 功能需求
1. **对象级控制**
   - `MetaObject` 增加 `has_record_type` 开关（默认关闭）。
   - 启用 record_type 时必须配置至少一个选项；有数据存在时禁止关闭。
   - 选项列表保存在新表 `meta_object_record_types` 中，记录 name 唯一且与对象关联。
   - System source 的对象不允许编辑 record_type 配置（包括选项增删改以及启停）。Custom 来源可编辑（name/type 不可变）。

2. **Record Type 选项管理**
   - 选项字段：`name`（存储值）、`label`（显示）、`description`（说明）、`order`（排序）、`source`。
   - 支持增删改查与排序。删除前必须确保没有业务记录引用该值；若有引用则阻止删除（无迁移流程）。
   - 修改时遵守 source 权限（system 不可编辑，custom 可改 label/description/order）。

3. **数据层行为**
   - 每个对象的物理数据表新增固定列 `record_type TEXT`，存储所选 `name`。
   - 当对象启用 record_type 时，创建/编辑记录必须提供合法的 `record_type` 值，缺失或非法值需报错。
   - Record type 在记录创建后不可修改；编辑时应保持只读。

4. **Runtime App 交互**
   - 创建记录：若对象启用 record_type 且有多个选项，需先弹出对话框让用户选择 record type，再进入表单；仅一个选项时自动使用并跳过弹窗。
   - 记录表单与详情/列表展示中必须显示 record_type 字段，并按照选项 label 呈现。
   - 表单中 record_type 字段只读（编辑模式不可更改）。

5. **Admin Console**
   - 对象创建/编辑界面提供开关和选项管理 UI，以配置 record_type。
   - 依据 source 控制编辑能力：system 对象显示信息但禁用操作；custom 对象可增删改选项。
   - 禁止在已有业务数据时关闭 record_type；删除被使用的选项应失败并提示。

6. **默认配置**
   - System 对象 Account 必须启用 record_type，预置两个不可编辑选项：`professional`、`hospital`。该字段需要出现在 Account 的页面布局中。

## 非功能 / 技术约束
- 继续遵循 metadata 权限矩阵：Name / Type 恒不可变；system 仅允许 label 可改，其余受限。
- 所有 API、服务、前端状态需要支持 `record_type` 相关字段并保持向下兼容。
- 需要相应的迁移脚本：给 `meta_objects` 和所有 `data_*` 表新增列，创建 `meta_object_record_types` 表，并为 Account 回填默认配置。
