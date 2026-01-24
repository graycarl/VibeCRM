# Requirement Analysis & Implementation Plan: Seed Data Refactoring

## 1. 需求描述

当前系统的 Seed 数据（元数据与记录）存在结构不标准、数据质量低的问题。主要需求是对 Seed 机制涉及的数据内容进行全面重构，使其符合标准的 B2B CRM 业务场景（医药行业背景）。

**核心目标**：
1.  **重构 Account 对象**：去除测试性质字段，建立标准的客户信息结构。
2.  **新增 Call 对象**：用于记录销售拜访，关联客户与产品。
3.  **新增 Product 对象**：管理公司产品（药品），供拜访记录关联。
4.  **数据优化**：生成高质量的预制数据（Account ~25条, Product 5条, Call ~75条）。

## 2. 详细设计

### 2.1 Metadata Schema (`db/seed/meta.yml`)

#### Modified Object: Account (`account`)
*   **移除字段**: `age`, `sex`, `birth`, `is_happly`
*   **保留字段**: `name`
*   **新增字段**:
    *   `industry` (Picklist): Technology, Healthcare, Retail, Manufacturing, Finance, Other
    *   `type` (Picklist): Prospect, Customer, Partner
    *   `website` (Text)
    *   `phone` (Text)
    *   `employees` (Number)
    *   `annual_revenue` (Number)

#### New Object: Product (`product`)
*   **Description**: Company Products (Pharmaceuticals)
*   **Name Field**: `name`
*   **Fields**:
    *   `name` (Text, System Default)
    *   `product_code` (Text)
    *   `category` (Picklist): Prescription, OTC, Supplement
    *   `price` (Number)
    *   `description` (Text)

#### New Object: Call (`call`)
*   **Description**: Sales activities and visits
*   **Name Field**: `subject`
*   **Fields**:
    *   `subject` (Text, Required)
    *   `account_id` (Lookup -> `account`, Required)
    *   `product_id` (Lookup -> `product`, Optional)
    *   `call_type` (Picklist): Call, Meeting, Email, Other
    *   `status` (Picklist): Planned, Completed, Cancelled
    *   `call_date` (Datetime, Required)
    *   `duration` (Number, Minutes)
    *   `description` (Text)

### 2.2 Seed Records

#### `db/seed/record-account.yml` (Rewrite)
*   生成 25 条模拟企业数据。
*   混合不同 Industry 和 Type。

#### `db/seed/record-product.yml` (New)
*   5 条药品数据：
    1.  Amoxicillin
    2.  Ibuprofen
    3.  Lisinopril
    4.  Metformin
    5.  Atorvastatin

#### `db/seed/record-call.yml` (New)
*   生成约 75 条拜访记录。
*   随机关联上述 Account 和 Product。
*   时间分布在最近 3 个月内。

## 3. 任务拆解 (Task List)

- [ ] **Task 1: Update Metadata Configuration**
    - 修改 `db/seed/meta.yml`，实施 Account 重构和 Call/Product 新增。
- [ ] **Task 2: Create Product Seed Data**
    - 创建 `db/seed/record-product.yml`。
- [ ] **Task 3: Refactor Account Seed Data**
    - 重写 `db/seed/record-account.yml`。
- [ ] **Task 4: Create Call Seed Data**
    - 创建 `db/seed/record-call.yml`。
- [ ] **Task 5: Verification**
    - 删除本地 `db/vibecrm.sqlite`。
    - 运行 `make seed-db`。
    - 验证数据库表结构和数据内容是否正确。

## 4. 执行计划

由于 `seeds.py` 逻辑是“如果对象不存在则创建”，且不处理 schema 变更（migration），**必须在执行前手动删除旧的 SQLite 数据库文件**。

```bash
rm db/vibecrm.sqlite
make seed-db
```
