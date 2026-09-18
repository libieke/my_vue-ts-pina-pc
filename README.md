# Vue3 TypeScript Pinia 后台管理系统

一个基于 Vue 3 + TypeScript + Pinia + Element Plus 的现代化后台管理系统模板，提供开箱即用的完整开发框架。

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [API 集成](#api-集成)
- [状态管理](#状态管理)
- [常用命令](#常用命令)

---

## 🎯 项目简介

本项目是一个功能完整的后台管理系统模板，集成了现代化的前端技术栈。系统包含用户登录、权限管理、用户列表、用户设置、数据展示等核心功能模块。

**主要特点：**
- ✨ 基于 Vue 3 Composition API
- 🔒 完整的身份验证和权限管理
- 📊 数据可视化（ECharts）
- 🎨 企业级UI组件库（Element Plus）
- 📦 自动导入和懒加载
- 🚀 快速的构建速度和开发体验
- 💾 Pinia 状态管理
- 🔄 动态路由和面包屑导航

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.4.37 | 渐进式 JavaScript 框架 |
| TypeScript | ^5.5.3 | JavaScript 的超集 |
| Pinia | ^2.2.2 | Vue 3 状态管理库 |
| Vue Router | ^4.4.5 | Vue 单页应用路由管理 |
| Element Plus | ^2.8.3 | 企业级 UI 组件库 |
| Ant Design Vue | ^4.2.5 | Ant Design 组件库 |
| Axios | ^1.7.7 | HTTP 客户端库 |
| ECharts | ^5.5.1 | 数据可视化库 |
| Vite | ^5.4.1 | 下一代前端构建工具 |
| Sass | ^1.78.0 | CSS 预处理器 |

**项目插件：**
- `unplugin-vue-components` - 自动导入组件
- `unplugin-auto-import` - 自动导入 API（Vue、Vue Router）
- `vite-plugin-svg-icons` - SVG 图标管理
- `postcss-nesting` - PostCSS 嵌套插件

---

## 📁 项目结构

```
vue3-ts-pina-temp/
├── src/                          # 源代码目录
│   ├── assets/                   # 静态资源
│   │   ├── pictrue/             # 图片资源
│   │   └── style/               # 全局样式
│   │       ├── common.scss      # 通用样式
│   │       ├── reset.scss       # 样式重置
│   │       └── variable.scss    # CSS 变量
│   │
│   ├── components/               # 全局组件
│   │   ├── 404/                 # 404 页面
│   │   ├── Breadcrumb/          # 面包屑导航
│   │   ├── ChartBar/            # 柱状图
│   │   ├── ContentTitle/        # 内容标题
│   │   ├── CustomTable/         # 自定义表格
│   │   ├── Dialog/              # 对话框
│   │   ├── headBar/             # 头部栏
│   │   ├── Pagination/          # 分页
│   │   ├── PieChart/            # 饼图
│   │   ├── Search/              # 搜索框
│   │   ├── sideBar/             # 侧边栏
│   │   ├── SidebarItem/         # 侧边栏项
│   │   ├── SvgIcon/             # SVG 图标
│   │   └── TagsView/            # 标签视图
│   │
│   ├── view/                     # 页面视图
│   │   ├── home/                # 首页
│   │   ├── layout/              # 布局
│   │   ├── login/               # 登录页
│   │   ├── userList/            # 用户列表
│   │   └── userSet/             # 用户设置
│   │
│   ├── store/                    # Pinia 状态管理
│   │   ├── home.ts              # 用户状态管理
│   │   ├── tags.ts              # 标签状态管理
│   │   └── types/               # 类型定义
│   │
│   ├── routes/                   # 路由配置
│   │   └── index.ts             # 路由文件
│   │
│   ├── api/                      # API 接口层
│   │   ├── api.ts               # API 接口定义
│   │   └── type.ts              # 接口类型定义
│   │
│   ├── utils/                    # 工具函数
│   │   ├── request.ts           # HTTP 请求工具
│   │   ├── token.ts             # Token 管理
│   │   └── utils.js             # 通用工具函数
│   │
│   ├── icons/                    # SVG 图标库
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 应用入口
│   ├── permission.ts             # 权限管理
│   ├── style.scss                # 全局样式
│   ├── vite-env.d.ts            # Vite 环境变量类型
│   └── auto-import.d.ts         # 自动导入类型声明
│
├── public/                       # 公共资源（直接复制到输出）
├── me-test/                      # 构建输出目录
├── index.html                    # HTML 入口文件
├── package.json                  # 项目依赖配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.app.json             # 应用 TS 配置
├── tsconfig.node.json            # Node TS 配置
├── vite.config.ts                # Vite 配置
├── components.d.ts               # 组件类型声明
├── Element-puls.d.ts            # Element Plus 类型声明
└── README.md                     # 项目文档
```

---

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0 或 pnpm >= 6.0.0

### 2. 克隆项目

```bash
git clone <项目地址>
cd vue3-ts-pina-temp
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

开服务器会在 `http://localhost:5173` 启动

### 5. 构建生产版本

```bash
npm run build
```

生成的文件将输出到 `me-test` 目录

### 6. 预览生产构建

```bash
npm run preview
```

---

## ⚙️ 环境配置

### 开发服务器配置

在 `vite.config.ts` 中配置开发服务器：

```typescript
server: {
  port: 5173,              // 开发服务器端口
  proxy: {
    "/api": {
      target: "http://192.168.1.104:8999/",  // API 代理地址
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

### API 代理说明

- **本地开发**：所有 `/api` 开头的请求会被代理到配置的 `target` 地址
- **修改 API 地址**：更改 `vite.config.ts` 中的 `target` 字段
- **跨域问题**：`changeOrigin: true` 会自动处理跨域问题

### 构建配置

```typescript
build: {
  outDir: "me-test",      // 输出目录
  assetsDir: "static",    // 静态资源目录
  target: "esnext",       // 构建目标
}
```

---

## 📝 开发指南

### 1. 创建新页面

在 `src/view/` 创建新页面目录：

```
src/view/newPage/
  └── index.vue    # 页面组件
```

```vue
<template>
  <div class="page-container">
    <h1>新页面</h1>
  </div>
</template>

<script setup lang="ts">
// TypeScript 相关代码
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}
</style>
```

### 2. 注册路由

在 `src/routes/index.ts` 添加路由配置：

```typescript
{
  path: "newPage",
  component: () => import("@/view/newPage/index.vue"),
  meta: {
    isShow: true,
    title: "新页面",
    icon: "icon-name",
  },
}
```

### 3. 创建新组件

在 `src/components/` 创建新组件：

```vue
<template>
  <div class="my-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped lang="scss">
.my-component {
  // 组件样式
}
</style>
```

**组件自动导入**：组件会自动注册，无需手动 import

### 4. 添加全局样式

在 `src/assets/style/` 目录中管理样式：

- `variable.scss` - CSS 变量定义
- `common.scss` - 通用样式类
- `reset.scss` - 样式重置

```scss
// 在组件中导入
@import "@/assets/style/variable.scss";
```

### 5. 使用 SVG 图标

1. 将 SVG 文件放在 `src/icons/` 目录
2. 在 `SvgIcon` 组件中使用：

```vue
<SvgIcon name="icon-name" />
```

---

## 🔌 API 集成

### 1. 创建 API 接口

在 `src/api/api.ts` 中定义 API 接口：

```typescript
import request from '@/utils/request'

// 定义请求参数类型
interface ReqLogin {
  name: string
  paw: string
}

// 定义响应数据类型
interface ItypeAPI<T> {
  data: T
  msg: string | null
  code: number
}

// 定义 API 方法
export const reqLogin = (params: ReqLogin): Promise<ItypeAPI<any>> => {
  return request({
    url: '/test',
    method: 'post',
    params
  })
}

export const reqUserInfo = () => {
  return request({
    url: '/test',
    method: 'post',
  })
}
```

### 2. HTTP 请求工具

`src/utils/request.ts` 中的 request 函数用于发送 HTTP 请求：

```typescript
import request from '@/utils/request'

// GET 请求
request({
  url: '/user/list',
  method: 'get',
  params: { page: 1 }
})

// POST 请求
request({
  url: '/user/add',
  method: 'post',
  data: { name: '张三' }
})
```

### 3. 请求拦截

request 工具已配置：
- ✅ 自动携带 Token
- ✅ 默认超时设置
- ✅ 响应错误处理

### 4. 在页面中使用 API

```vue
<script setup lang="ts">
import { reqUserInfo } from '@/api/api'
import { ref } from 'vue'

const userInfo = ref(null)

const fetchUserInfo = async () => {
  try {
    const result = await reqUserInfo()
    if (result.code === 200) {
      userInfo.value = result.data
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserInfo()
})
</script>
```

---

## 🗄️ 状态管理

### 1. Pinia 简介

Pinia 是 Vue 3 的官方状态管理库，比 Vuex 更简洁易用。

### 2. 创建 Store

在 `src/store/` 创建新的 Store，例如 `user.ts`：

```typescript
import { defineStore, acceptHMRUpdate } from "pinia"
import type { UserState } from './types/type'

const useUserStore = defineStore("user", {
  state: () => {
    return {
      username: '',
      avatar: '',
      token: '',
      fold: false
    }
  },
  
  getters: {
    // 派生状态
    isLogin(): boolean {
      return !!this.token
    }
  },
  
  actions: {
    // 异步操作
    async userLogin(data: any) {
      try {
        const result = await reqLogin(data)
        if (result.code === 200) {
          this.token = result.data.token
          SET_TOKEN(result.data.token)
          return 'ok'
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 同步操作
    setUsername(name: string) {
      this.username = name
    }
  }
})

// HMR 热更新支持
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

export default useUserStore
```

### 3. 在组件中使用 Store

```vue
<script setup lang="ts">
import { useUserStore } from '@/store/home'

// 获取 Store 实例
const userStore = useUserStore()

// 访问状态
const username = userStore.username

// 访问 getter
const isLogin = userStore.isLogin

// 调用 action
const handleLogin = async () => {
  const result = await userStore.userLogin({ 
    name: 'admin', 
    paw: '123456' 
  })
}

// 直接修改状态
const toggleMenu = () => {
  userStore.fold = !userStore.fold
}
</script>
```

### 4. 主要 Store 说明

**home.ts - 用户状态管理**
- 管理用户登录、用户信息、Token 等
- 包含登录、获取用户信息等异步操作

**tags.ts - 标签页管理**
- 管理打开的标签页列表
- 支持添加、删除、更新标签页

---

## 🔐 权限管理

### Token 管理

Token 相关函数在 `src/utils/token.ts` 中：

```typescript
import { GET_TOKEN, SET_TOKEN, REMOVE_TOKEN } from '@/utils/token'

// 获取 Token
const token = GET_TOKEN()

// 设置 Token
SET_TOKEN('token_value')

// 移除 Token
REMOVE_TOKEN()
```

### 权限检查

在 `src/permission.ts` 中配置路由权限拦截：

```typescript
// 权限检查逻辑
// 检查用户是否已登录
// 检查用户是否有权限访问该页面
```

---

## 🎨 样式开发

### Sass 变量

在 `src/assets/style/variable.scss` 中定义全局变量：

```scss
// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$error-color: #f56c6c;

// 间距变量
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 圆角变量
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
```

### 在组件中使用

```vue
<style scoped lang="scss">
@import "@/assets/style/variable.scss";

.my-element {
  padding: $spacing-md;
  color: $primary-color;
  border-radius: $border-radius-md;
}
</style>
```

---

## 📊 数据可视化

### 使用 ECharts

项目已集成 ECharts，在 `ChartBar` 和 `PieChart` 组件中有示例：

```vue
<script setup lang="ts">
import { ECOption } from 'echarts';
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts;

const options: ECOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      smooth: true
    }
  ]
};

onMounted(() => {
  chart = echarts.init(chartRef.value);
  chart.setOption(options);
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>
```

---

## 📦 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm install` | 安装依赖 |
| `npm install <package>` | 安装新包 |
| `npm uninstall <package>` | 卸载包 |

---

## 🔧 配置文件说明

### tsconfig.json
TypeScript 编译配置，定义了编译选项和路径别名。

### vite.config.ts
Vite 构建配置，包括：
- 插件配置（Vue、SVG、自动导入等）
- 开发服务器配置
- 构建输出配置
- 路径别名配置

### package.json
项目依赖和脚本配置

---

## 🐛 故障排除

### 1. 开发服务器无法启动
```bash
# 清除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安装依赖
npm install
# 启动开发服务器
npm run dev
```

### 2. 模块无法找到
- 检查导入路径是否正确
- 检查 @ 别名是否正确配置在 vite.config.ts 中
- 确保文件扩展名正确

### 3. API 请求失败
- 检查 API 代理地址是否正确配置
- 查看浏览器开发者工具的 Network 标签页
- 确保后端服务正常运行

### 4. 样式未生效
- 检查 `<style>` 标签是否添加 `scoped` 属性
- 检查是否正确导入了 Sass 变量
- 清除浏览器缓存

---

## 📚 学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue Router 官方文档](https://router.vuejs.org/)

---

## 📄 许可证

This project is licensed under the MIT License.

---

## 👥 贡献指南

欢迎提出问题、功能建议和拉取请求。

---

**最后更新**: 2026年9月18日
