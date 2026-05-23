# 🌟 黄金综合管理平台 (Gold Management Platform)

![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.2-FFDE5C?logo=pinia&logoColor=black)

一款面向移动端设计的现代化黄金投资综合管理平台，拥有极致的 Apple 风格 UI/UX，集成了**实时金价获取**、**持仓与收益计算**以及**AI大模型智能分析**等核心功能。

## ✨ 核心特性 (Features)

- 📈 **实时金价追踪**：毫秒级同步最新大盘金价（底层采用原生 JSONP 协议，**无视浏览器 CORS 跨域限制**，无需后端服务器即可直连数据源）。
- 💼 **智能持仓管理**：支持加仓、减仓，并基于实时金价自动计算**当前总市值**、**累计收益**、**持仓均价**以及**回本所需金价**。
- 🤖 **AI 智能投顾分析**：
  - 内置深度的 LLM 聊天终端，支持 OpenAI 兼容格式的任意大模型（如 DeepSeek、GPT-4o 等）。
  - 支持 **Streaming 流式打字机输出** 和 **Markdown 富文本渲染**。
  - 会话支持独立上下文管理，聊天界面拥有极简的磨砂毛玻璃质感与精美的组件交互。
- 📱 **极致的视觉体验**：
  - 纯粹的 Apple (iOS) 设计风格：全景大圆角、流畅过渡动画、毛玻璃遮罩层。
  - 所有组件和图标均为深度定制的极简风格，无损且轻量。
- 💾 **无后端/纯静态部署**：
  - 数据全部基于 `localStorage` 进行持久化（利用 Pinia 插件）。
  - **100% 静态应用**，支持一键零成本部署到 GitHub Pages、Vercel 或 Gitee Pages。

## 🚀 本地运行与部署 (Getting Started)

### 1. 克隆项目与安装依赖
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. 运行开发环境
```bash
npm run dev
```

### 3. 打包构建
```bash
npm run build
```
打包后会生成 `dist` 目录，直接将该目录托管至任意静态服务器（如 GitHub Pages）即可完美运行。

## 🛠️ 技术栈说明 (Tech Stack)

* **核心框架**: Vue 3 (Composition API) + TypeScript
* **构建引擎**: Vite
* **状态管理**: Pinia + `pinia-plugin-persistedstate` (数据本地持久化)
* **样式驱动**: Tailwind CSS 
* **路由控制**: Vue Router 4 (具备原生级 TabBar 切换体验)
* **AI 渲染层**: `marked` (流式响应解析与 Markdown 渲染)

## 💡 技术亮点：零后端跨域 (Zero-Backend CORS Bypass)
大部分前端开源项目在获取外部第三方 API 时，往往需要依赖 Node.js 中间件或 Nginx 代理来解决跨域问题。
本项目在获取上游实时金价时，采用原生的 **JSONP** 策略。它使浏览器能够直接、合法地跨域拉取数据，让项目彻底摆脱了对后端的依赖，极大降低了开发者的部署门槛和服务器成本。

## 📄 开源协议
[MIT License](LICENSE). 欢迎发起 Issue 或提交 Pull Request！
