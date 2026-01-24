# VibeCRM 代码结构指南

本文档总结了 VibeCRM 前后端代码的文件结构，旨在帮助开发者快速定位功能模块。

## 1. 后端结构 (`backend/`)
后端采用 **FastAPI + SQLAlchemy**，遵循经典的 Service 模式。

*   **`app/api/`**: API 接口层
    *   `endpoints/`: 路由实现（`meta.py` 元数据, `data.py` 业务数据, `layout.py` 布局）。
    *   `deps.py`: 依赖注入（DB Session, Auth）。
*   **`app/models/`**: SQLAlchemy ORM 模型
    *   `metadata.py`: `MetaObject`, `MetaField` 等核心元数据模型。
    *   `layout.py`: 页面布局持久化模型。
*   **`app/schemas/`**: Pydantic 数据验证
    *   `metadata.py`: 元数据 DTO。
    *   `dynamic.py`: 动态数据请求/响应模型。
*   **`app/services/`**: 业务逻辑层 (核心)
    *   `meta_service.py`: 元数据 CRUD 逻辑。
    *   `data_service.py`: **核心**，处理元数据驱动的业务数据操作。
    *   `schema_service.py`: 动态维护数据库表结构 (DDL)。
*   **`app/db/`**: 数据库配置
    *   `seeds.py`: 系统初始化种子数据（系统对象、标准字段）。
*   **`tests/`**: Pytest 测试用例。

---

## 2. 前端结构 (`frontend/`)
前端采用 **React + TypeScript + MUI**，分为控制台和运行时两部分。

*   **`src/pages/`**: 页面组件
    *   `admin/`: **管理控制台**。用于配置对象、字段、布局。
    *   `runtime/`: **运行时应用**。根据元数据动态渲染的业务操作界面。
*   **`src/components/`**: UI 组件
    *   `dynamic/`: **动态渲染组件**。根据元数据定义自动生成的 UI 元素。
    *   `admin/` / `data/` / `common/`: 各类功能组件。
*   **`src/services/`**: API 客户端
    *   `metaApi.ts`: 元数据操作。
    *   `dataApi.ts`: 业务数据操作。
*   **`src/types/`**: TypeScript 定义
    *   `metadata.ts`: 核心元数据接口定义。
*   **`src/utils/`**: 工具类
    *   `metadata.ts`: 元数据解析与处理逻辑。

---

## 3. 快速索引

| 任务 | 后端主要位置 | 前端主要位置 |
| :--- | :--- | :--- |
| **元数据管理 (CRUD)** | `app/services/meta_service.py` | `src/pages/admin/` |
| **动态数据读写** | `app/services/data_service.py` | `src/services/dataApi.ts` |
| **页面布局配置** | `app/api/endpoints/layout.py` | `src/pages/admin/PageLayoutEditor.tsx` |
| **字段渲染逻辑** | - | `src/components/dynamic/` |
| **数据库初始化** | `app/db/seeds.py` | - |
| **权限与认证** | `app/core/security.py` | `src/services/auth.ts` |

---

## 4. 开发约定
- **后端**: 进入 `backend` 目录使用 `uv run` 执行命令。
- **前端**: 组件测试文件 (*.test.tsx) 采用就近原则放置。
- **元数据驱动**: 优先通过修改元数据而非硬编码来实现业务功能。
