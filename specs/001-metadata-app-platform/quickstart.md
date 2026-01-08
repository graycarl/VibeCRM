# Quickstart: 运行元数据平台

本指南介绍如何在本地环境启动 VibeCRM 元数据平台。

## 前置要求 (Prerequisites)

- **Python 3.11+**
- Node.js v20+ (for Frontend)
- npm v10+

## 安装 (Installation)

### 1. 后端 (Backend)

进入 `backend` 目录并创建虚拟环境：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate  # Windows
```

安装依赖（确保 requirements.txt 中不包含 aiosqlite 等异步库）：

```bash
pip install -r requirements.txt
```

### 2. 前端 (Frontend)

进入 `frontend` 目录：

```bash
cd frontend
npm install
```

## 启动 (Running)

建议开启两个终端窗口分别启动。

### 1. 启动后端 API

在 `backend` 目录下（确保虚拟环境已激活）：

```bash
# 注意：FastAPI 将以同步模式运行业务逻辑
uvicorn app.main:app --reload --port 8000
```
API 文档访问地址: http://localhost:8000/docs

### 2. 启动前端 App

在 `frontend` 目录下：

```bash
npm run dev
```
应用访问地址: http://localhost:5173

## 初始化数据库 (Database Setup)

系统首次启动时会自动检查 SQLite 数据库文件 (`db/vibecrm.sqlite`)。
FastAPI 应用启动时 (`lifespan` event) 将自动执行同步初始化任务：
1.  创建 `meta_objects`, `meta_fields` 等元数据表。
2.  预播种 (Seed) `User`, `Role` 等系统对象。

## 常用命令

### Backend
- `pytest`: 运行测试
- `ruff check .`: 代码风格检查

### Frontend
- `npm run test`: 运行测试
- `npm run lint`: 代码风格检查
