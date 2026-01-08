# GEMINI

## Gemini Chat

- **尽量使用中文进行对话和交流**

## 项目简介

VibeCRM 是一个**元数据驱动的应用开发平台 (Metadata Driven App Platform)**，旨在提供类似 Salesforce 的低代码开发能力。用户可以通过配置元数据（对象、字段、页面布局等）来快速构建业务应用，系统会根据元数据在运行时动态生成 UI 界面和数据库结构。

**核心特性：**
- **元数据驱动 (Metadata Driven):** 业务逻辑、数据模型和界面布局均由元数据定义，支持运行时动态修改。
- **独立表存储 (Table-Per-Object):** 每个自定义对象底层对应一张独立的物理表，兼顾灵活性与性能。
- **双模界面:** 提供面向最终用户的 **Runtime App**（运行时应用）和面向管理员的 **Admin Console**（管理控制台）。
- **现代技术栈:** 后端采用 Python (FastAPI + SQLAlchemy)，前端采用 React 18，使用 SQLite 作为轻量级数据库。

### 核心概念 (Core Concepts)
- **Metadata (元数据)**: 定义数据结构的数据，包括对象定义(CustomObject)、字段定义(CustomField)、页面布局(PageLayout)等。
- **CustomObject (自定义对象)**: 业务实体的元数据定义，包含 Label、API Name 等。支持 System Objects (系统预置) 和 Custom Objects (用户定义)。
- **CustomField (自定义字段)**: 对象属性的元数据定义，支持多种数据类型 (Text, Number, Date, Lookup 等)。
- **Runtime App (运行时应用)**: 终端用户使用的界面，根据元数据动态渲染列表、表单和详情页。
- **Admin Console (管理控制台)**: 管理员使用的界面，用于创建和维护元数据。

### 数据模型 (Data Model)
- **Table-Per-Object (独立表存储)**: 每个 CustomObject 在数据库中对应一张独立的物理表 (`data_{name}`)。
- **Record (记录)**: 存储在物理表中的实际业务数据。
- **Lookup (查找关系)**: 简单的 1:N 引用关系，存储目标记录的 ID。

### 界面配置 (UI Configuration)
- **PageLayout (页面布局)**: 定义对象详情页和编辑页的字段分组、顺序等结构。
- **ListView (列表视图)**: 定义对象列表页显示的列 (Columns) 和筛选条件 (Filters)。

### 权限与安全 (Permissions & Security)
- **Dynamic Roles (动态角色)**: 基于角色的权限控制 (RBAC)，控制对象级别的 CRUD 权限。
- **System Objects (系统对象)**: 系统初始化时预播种的元数据对象 (如 User, Role)，不可删除。

## Active Technologies
- Make (GNU Make 3.81+), Python 3.11+ (Backend), Node.js 18+ (Frontend) + `uv` (Python pkg manager), `npm` (Node pkg manager), `pytest` (002-setup-dev-makefile)
- SQLite (via `backend/app/db/init_db.py`) (002-setup-dev-makefile)

- Python 3.11+ (Backend)
- React 18 / TypeScript 5.0+ (Frontend)
- SQLite (本地文件数据库，支持 Table-Per-Object 动态建表)
- uv (Python dependency management)
- Python 3.11+, TypeScript 5.0+ + FastAPI, SQLAlchemy (Sync), React 18, MUI, React Hook Form (001-metadata-app-platform)
- SQLite (Local file DB) (001-metadata-app-platform)

## Coding Tips

- 使用 `uv run` 来运行 python 程序或脚本；
- 当需要查阅第三方类库文档时，请使用 context7 相关工具；


## Recent Changes
- 002-setup-dev-makefile: Added Make (GNU Make 3.81+), Python 3.11+ (Backend), Node.js 18+ (Frontend) + `uv` (Python pkg manager), `npm` (Node pkg manager), `pytest`

- 001-metadata-app-platform: Defined technical plan with Sync Python/FastAPI backend and React frontend.
