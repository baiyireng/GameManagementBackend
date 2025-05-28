# 游戏管理后台（Admin）

## 项目简介
基于 Vue3 + TypeScript + Element Plus 开发的游戏管理后台，支持游戏信息管理、编辑、发布等核心功能。集成代码规范（ESLint + Prettier）、路由管理（Vue Router）等企业级开发配置，适合快速迭代开发。

---

## 技术栈
| 技术/工具          | 版本       | 说明                  |
|--------------------|------------|-----------------------|
| Vue.js             | ^3.5.13    | 前端框架              |
| Vue Router         | ^4.2.4     | 路由管理              |
| TypeScript         | ~5.8.3     | 类型系统              |
| Element Plus       | ^2.9.11    | 组件库                |
| Vite               | ^6.3.5     | 构建工具              |
| ESLint             | ^9.27.0    | 代码检查              |
| Prettier           | ^3.5.3     | 代码格式化            |

---

## 快速开始

### 环境要求
- Node.js ≥ 16.0.0（推荐使用 LTS 版本）
- Yarn ≥ 1.22.0（包管理工具）

### 安装与运行
```bash
# 克隆项目（若从 Git 仓库获取）
git clone <仓库地址>

# 进入项目目录
cd d:\my_project\GameManagementBackend\admin

# 安装依赖
yarn install

# 启动开发服务器（默认端口 5173）
yarn dev

# 构建生产环境包
yarn build
```

## 项目结构
```bash
admin/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/
│   │   └── index.ts
│   ├── assets/
│   │   ├── css/
│   │   │   └── index.css
│   │   └── images/
│   │       └── logo.png
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Dialog.vue
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   └──...
│   │   └──...
│   ├── router/
│   │   └── index.ts
│   ├── store/
│   │   └── index.ts
│   ├── types/
│   │   └── index.d.ts
│   ├── views/
│   │   ├── GameList.vue
│   │   ├── GameEdit.vue
│   │   ├── GamePublish.vue
│   │   └──...
│   ├── App.vue
│   ├── main.ts
│   └──...
├── .eslintrc.js
├── .prettierrc.js
├──package.json
├──tsconfig.json
├──vite.config.ts
└──...
```
## 功能模块
- 游戏管理
  - 游戏列表
  - 游戏编辑
  - 游戏发布
- 用户管理
  - 用户列表
  - 用户编辑
  - 用户权限
- 系统设置
  - 系统配置
  - 日志管理
  - 权限管理
## 注意事项
- 请确保 Node.js 和 Yarn 的版本符合要求。
- 项目依赖的第三方库版本可能会有更新，请定期检查。
- 项目中使用了 Element Plus 组件库，确保版本兼容。
- 如需使用其他组件库，请根据需要调整配置。
- 项目中使用了 TypeScript 进行类型检查，确保代码的类型安全性。
- 项目中使用了 ESLint 和 Prettier 进行代码规范和格式化，确保代码质量。
- 项目中使用了 Vue Router 进行路由管理，确保路由配置正确。
- 项目中使用了 Vuex 进行状态管理，确保状态管理逻辑正确。
- 项目中使用了 Vite 进行开发服务器和构建工具，确保开发和构建效率。
- 项目中使用了 Axios 进行 HTTP 请求，确保请求配置正确。
- 项目中使用了 Mock.js 进行模拟数据，确保模拟数据逻辑正确。
- 项目中使用了 Lodash 进行工具函数，确保工具函数逻辑正确。
- 项目中使用了 Moment.js 进行日期处理，确保日期处理逻辑正确。
- 项目中使用了 ECharts 进行图表绘制，确保图表绘制逻辑正确。
- 项目中使用了 Vuex 进行状态管理，确保状态管理逻辑正确。
- 项目中使用了 Vue Router 进行路由管理，确保路由配置正确。
- 项目中使用了 Vuex 进行状态管理，确保状态管理逻辑正确。
