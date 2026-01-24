# VibeCRM Seed Data Guide

VibeCRM 使用一套基于 YAML 的 Seed（种子数据）机制来初始化系统的元数据结构和基础业务数据。这套机制允许开发者以声明式的方式定义对象、字段以及预置记录，无需手动编写 SQL 或 API 调用。

## 1. 目录结构

Seed 数据文件位于项目根目录的 `db/seed/` 文件夹下。加载顺序如下：

1.  **`meta.yml`**: 核心元数据定义（角色、对象、字段）。这是系统初始化的基石，必须最先加载。
2.  **`record-*.yml`**: 具体的业务数据记录。文件按文件名的字母顺序依次加载（例如 `record-01-account.yml` 会在 `record-02-product.yml` 之前加载）。

## 2. 元数据定义 (`meta.yml`)

`meta.yml` 定义了系统的 Schema。主要包含两部分：`roles` 和 `objects`。

### Roles (角色)
定义系统的权限角色。

```yaml
roles:
  - name: admin
    label: 系统管理员
    source: system
```

### Objects (对象)
定义业务实体及其字段。支持标准对象和自定义对象（Custom Object）。

**自定义对象规范**:
*   `name`: 必须以 `cs_` 开头 (例如 `cs_expense`)。
*   `source`: 必须为 `custom`。
*   字段名也必须以 `cs_` 开头。

**示例**:
```yaml
objects:
  - name: account
    label: 客户
    source: system
    name_field: name  # 指定哪个字段作为记录的显示名称
    fields:
      - name: name
        label: 客户名称
        data_type: Text
        is_required: true
        source: system
      - name: type
        label: 类型
        data_type: Picklist
        options:
          - name: customer
            label: 现有客户
          - name: prospect
            label: 潜在客户
```

## 3. 数据记录 (`record-*.yml`)

记录文件用于预置业务数据。支持智能关联解析。

**基本格式**:
```yaml
records:
  - object: account
    data:
      name: 华康医药集团
      industry: healthcare
      type: customer
```

### 智能关联 (Smart Lookup Resolution)

这是 Seed 系统的一个强大特性。当定义关联关系（Lookup 字段）时，你不需要知道目标记录的数据库 ID，只需提供目标记录的**名称**（Name Field 的值）。系统会在导入时自动查找并转换为 ID。

**工作原理**:
1.  在 `meta.yml` 中定义对象时，通过 `name_field` 属性指定该对象的“名称字段”（例如 Account 的 `name`，Call 的 `subject`）。
2.  在记录 YAML 中，Lookup 字段直接填写目标对象的名称字符串。
3.  Seed 引擎 (`seeds.py`) 会在写入前根据名称查询目标表的 ID 并自动替换。

**示例**:

1.  **定义客户 (Account)**:
    ```yaml
    # record-01-account.yml
    - object: account
      data:
        name: 华康医药集团
    ```

2.  **引用客户 (Call)**:
    ```yaml
    # record-03-call.yml
    - object: call
      data:
        subject: 季度回访
        # 这里直接写客户名称，系统会自动查找 "华康医药集团" 的 ID
        account_id: 华康医药集团
    ```

3.  **引用拜访 (Expense)**:
    ```yaml
    # record-04-expense.yml
    - object: cs_expense
      data:
        cs_title: 打车费
        # 引用 Call 的 subject
        cs_call_id: 季度回访
    ```

## 4. 操作命令

### 重置并重新加载
此命令会**删除**当前的 SQLite 数据库文件，并重新运行 Seed 流程。所有现有数据将丢失。

```bash
make reset
```

### 仅运行 Seed 脚本
如果数据库已存在，此命令会尝试加载尚未存在的数据（幂等性取决于具体实现，通常建议用 `make reset`）。

```bash
make seed-db
```

## 5. 开发建议

*   **文件命名**: 使用数字前缀（如 `record-01-xxx.yml`）来严格控制加载顺序，确保被引用的对象（如 Account）先于引用它的对象（如 Call）创建。
*   **名称唯一性**: 为了确保 Lookup 解析的准确性，Seed 数据中作为引用目标的名称（如公司名、产品名）应保持唯一。
*   **中文字符**: YAML 文件支持 UTF-8，可以直接在数据中使用中文。
