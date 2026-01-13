# VibeCRM

VibeCRM is a **Metadata-Driven Application Platform** designed to provide low-code development capabilities similar to Salesforce. It allows users to build business applications by configuring metadata (objects, fields, layouts), dynamically generating UI and database structures at runtime.

## Core Features

- **Metadata Driven**: UI and data models are defined by metadata, modifiable at runtime.
- **Table-Per-Object**: Each custom object has its own physical database table for performance and flexibility.
- **Dual Interface**: Includes an **Admin Console** for configuration and a **Runtime App** for end-users.
- **Modern Tech Stack**: FastAPI (Python), React 18 (TypeScript), and SQLite.

## Project Structure

- `backend/`: FastAPI application, metadata engine, and data services.
- `frontend/`: React application with Material UI for Admin and Runtime interfaces.
- `db/seed/`: YAML-based metadata and initial record seeds.
- `scripts/`: Utility scripts for data generation and maintenance.

## Prerequisites

- **Python**: 3.11+ (managed by `uv`)
- **Node.js**: 18+ (managed by `npm`)
- **GNU Make**: 3.81+

## Getting Started

### 1. Installation
Initialize the environment (installs Python and Node dependencies):
```bash
make init
```

### 2. Database Setup
Create and seed the database with test data:
```bash
make reset
```

### 3. Running the Application
Start both backend and frontend development servers:
```bash
make dev
```
- Backend API: `http://localhost:8000`
- Frontend App: `http://localhost:5173`

## Development Commands

- `make test`: Run all backend and frontend tests.
- `make seed-db`: Seed the database with metadata and sample records.
- `cd backend && uv run python -m app.cli --help`: Access backend CLI tools.

## TODO

- [x] 完整的分页功能（当前为客户端分页）
- [ ] 对 number 类型字段支持页面上指定排序
- [ ] Custom Field 的 Name 必须以 cs_ 开头
- [ ] System Picklist Field 的选项不允许修改
- [ ] Custom Field 只有 Name, Type 等关键属性不允许修改，其他属性允许修改
- [ ] 支持 Record Type 和 State 概念
- [ ] 实现完整的 Lookup Field
- [ ] 实现完整的 Metadata Field
- [ ] 实现 Data Layout
- [ ] 支持用户自定义 List View，包含字段排序和隐藏
- [ ] 支持为用户配置 Page Layout，按 Record Type、State、Role 等维度区分
