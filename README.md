# MD2Rich - Markdown 转富文本工具

将 Markdown 转换为可复制的富文本格式，一键粘贴到微信公众号等平台发布。

![演示截图](https://img.shields.io/badge/版本-1.0.0-blue) ![许可证](https://img.shields.io/badge/许可证-MIT-green)

## ✨ 功能特性

- 📝 **实时预览** - 左侧编辑 Markdown，右侧即时渲染富文本
- 📋 **一键复制** - 复制为富文本格式，直接粘贴到公众号编辑器
- 🎨 **三套主题** - 默认 / 深色 / 清新，满足不同场景
- 🖼️ **图片上传** - 支持拖拽上传，自动转换为 Base64 格式
- 💾 **自动保存** - 内容和主题偏好自动保存到本地
- 📱 **响应式设计** - 适配桌面和移动端

## 🚀 快速开始

### 方式一：直接使用

1. 下载项目文件
2. 双击打开 `index.html`
3. 开始编辑

### 方式二：本地服务器

```bash
# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

访问 `http://localhost:8080`

## 📖 使用说明

### 基本操作

1. 在左侧编辑区输入或粘贴 Markdown 内容
2. 右侧预览区实时显示渲染效果
3. 点击「📋 一键复制」按钮
4. 在微信公众号编辑器中 `Ctrl+V` 粘贴

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Shift + C` | 复制富文本 |
| `Ctrl + S` | 手动保存提示 |

### 图片处理

1. 点击「🖼️ 上传图片」或直接拖拽图片到页面
2. 图片自动转为 Base64 格式（无需图床）
3. 点击「复制链接」获取 Markdown 语法
4. 粘贴到编辑区即可

## 📁 项目结构

```
Markdown2html/
├── index.html     # 主页面
├── index.css      # 样式文件（含三套主题）
├── index.js       # 核心逻辑
└── README.md      # 项目说明
```

## 🛠️ 技术栈

- **Markdown 解析**: [marked.js](https://marked.js.org/)
- **代码高亮**: [highlight.js](https://highlightjs.org/)
- **剪贴板 API**: 原生 Clipboard API
- **存储**: localStorage

## 🎨 主题预览

| 主题 | 说明 |
|------|------|
| ☀️ 默认 | 白色背景，蓝色强调色 |
| 🌙 深色 | 深色背景，护眼配色 |
| 🌿 清新 | 淡绿色调，清新自然 |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
