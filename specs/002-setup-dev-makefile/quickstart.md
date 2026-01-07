# 快速开始 (Quickstart)

本指南介绍如何使用新的 Makefile 进行日常开发。

## 前置要求

- macOS 或 Linux 环境
- 已安装 `make`
- 已安装 `uv` (Python 依赖管理)
- 已安装 Node.js 和 npm

## 常用命令

### 1. 初始化环境

首次 clone 项目或需要重置环境时使用：

```bash
make init
```

此命令会：
- 安装后端 Python 依赖 (`uv sync`)
- 安装前端 Node.js 依赖 (`npm ci`)

### 2. 启动开发服务

同时启动后端 API 和前端开发服务器：

```bash
make dev
```

- 后端运行在 `http://localhost:8000` (默认)
- 前端运行在 `http://localhost:5173` (默认)
- 按 `Ctrl + C` 停止所有服务

### 3. 运行测试

运行所有测试（后端 + 前端）：

```bash
make test
```

如果后端测试失败，前端测试将不会执行（Fail Fast）。

### 4. 重置数据库

清除数据并重新播种：

```bash
make reset
```

**警告**：这将删除本地 SQLite 数据库文件并丢失所有未保存的数据。
