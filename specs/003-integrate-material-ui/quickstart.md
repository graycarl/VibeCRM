# 快速开始: 集成 Material UI

**分支**: `003-integrate-material-ui`

## 前端启动说明

本功能主要涉及前端 UI 库的集成。

### 1. 安装依赖

确保已安装 Node.js 18+。

```bash
cd frontend
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 3. 验证 Material UI 集成

- **样式检查**: 页面上的按钮和输入框应具有 Material Design 风格（如点击波纹效果）。
- **字体检查**: 打开开发者工具 (F12)，检查 `<body>` 元素的 `font-family` 是否包含 "Roboto"。
- **无报错**: 控制台不应有关于 ThemeProvider 或 MUI 样式的错误。

### 4. 运行测试

```bash
npm run test
```

确保所有 UI 组件测试通过。
