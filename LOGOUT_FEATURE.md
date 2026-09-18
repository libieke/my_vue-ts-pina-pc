# 退出登录功能使用说明

完整的本地退出登录功能实现，无需后端接口支持。

## 📋 功能概述

本项目实现了一个完整的退出登录流程，包括：
- ✅ 用户确认对话框
- ✅ 清空所有用户信息
- ✅ 清除本地 Token
- ✅ 自动重定向到登录页
- ✅ 本地 Mock 登录接口（无需后端）
- ✅ 完善的权限管理

---

## 🚀 快速开始

### 测试账号（Mock 数据）

项目内置 2 个测试账号，无需后端即可完整测试登录/退出流程：

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | 111111 | 管理员 |
| user | 123456 | 普通用户 |

### 测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问登录页面**
   - 打开浏览器访问 `http://localhost:5173`
   - 自动重定向到登录页面

3. **登录**
   - 账号填写：`admin`
   - 密码填写：`111111`
   - 点击"登录"按钮

4. **进入首页**
   - 登录成功后自动跳转到首页

5. **测试退出登录**
   - 点击右上角"退出"按钮
   - 选择"确定"确认退出
   - 显示"退出登录成功"提示
   - 自动返回登录页面

---

## 🏗️ 架构设计

### 项目结构

```
src/
├── api/
│   ├── api.ts              # API 接口定义 + Mock 数据
│   └── type.ts             # 类型定义
├── store/
│   ├── home.ts             # 用户状态管理（登录/退出）
│   └── tags.ts             # 标签页管理
├── components/
│   └── headBar/
│       └── index.vue       # 头部栏（包含退出登录按钮）
├── utils/
│   ├── request.ts          # HTTP 请求工具
│   └── token.ts            # Token 管理工具
├── permission.ts           # 路由权限管理
└── main.ts                 # 应用入口
```

---

## 🔄 退出登录流程

### 完整流程图

```
点击"退出"按钮
    ↓
弹出确认对话框 ("确定要退出登录吗？")
    ↓
    ├─ 用户选择"确定"
    │     ↓
    │  调用 userStore.userLogout()
    │     ↓
    │  清空 Pinia state：
    │    - token = ''
    │    - username = ''
    │    - avatar = ''
    │    - fold = false
    │     ↓
    │  清空本地存储：
    │    - localStorage.removeItem('TOKEN')
    │     ↓
    │  显示"退出登录成功"提示
    │     ↓
    │  延迟 500ms 后跳转到登录页
    │     ↓
    │  路由跳转：/login?redirect=/home
    │
    └─ 用户选择"取消"
          ↓
       显示"已取消退出"提示
       ↓
       不做任何操作，停留在原页面
```

---

## 📝 核心代码解析

### 1. 退出登录按钮（headBar/index.vue）

```vue
<!-- 退出登录按钮 -->
<div class="logout padding-r-10" @click="handleLogout">
  <el-icon style="margin-right: 4px;"><SwitchButton /></el-icon>
  退出
</div>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";

const handleLogout = () => {
  // 显示确认对话框
  ElMessageBox.confirm(
    "确定要退出登录吗？",
    "退出登录",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      // 用户点击确定
      try {
        // 1. 调用 store 方法清空用户信息
        await userStore.userLogout();
        
        // 2. 显示成功提示
        ElMessage.success("退出登录成功");
        
        // 3. 延迟后跳转登录页
        setTimeout(() => {
          $router.push({
            path: "/login",
            query: { redirect: $route.path },
          });
        }, 500);
      } catch (error) {
        ElMessage.error("退出登录失败，请重试");
      }
    })
    .catch(() => {
      // 用户点击取消
      ElMessage.info("已取消退出");
    });
};
</script>
```

### 2. 退出登录 Action（store/home.ts）

```typescript
/**
 * 退出登录
 * 清空所有用户信息和持久化数据
 */
userLogout() {
  // 1. 清空 Pinia store 中的状态
  this.token = ''
  this.username = ''
  this.avatar = ''
  this.fold = false
  
  // 2. 清空本地存储中的 token
  REMOVE_TOKEN()
  
  // 3. 可选：清空其他相关存储
  // localStorage.removeItem('user_info')
  // sessionStorage.clear()
  
  return Promise.resolve()
}
```

### 3. Token 管理工具（utils/token.ts）

```typescript
/**
 * 存储 Token 到本地存储
 */
export const SET_TOKEN = (token: string) => {
  localStorage.setItem('TOKEN', token)
}

/**
 * 从本地存储获取 Token
 */
export const GET_TOKEN = () => {
  return localStorage.getItem('TOKEN')
}

/**
 * 从本地存储删除 Token
 */
export const REMOVE_TOKEN = () => {
  localStorage.removeItem('TOKEN')
}
```

### 4. 权限管理（permission.ts）

```typescript
/**
 * 路由前置守卫
 * 检查用户是否已登录，控制页面访问权限
 */
router.beforeEach(async (to: any, _from: any, next: any) => {
  nprogress.start()
  
  // 从 store 和本地存储获取 token
  let token = useStore.token || GET_TOKEN()
  
  if (token) {
    // 已登录
    if (to.path === '/login') {
      // 已登录不能访问登录页，跳转到首页
      next({ path: '/' })
    } else {
      // 访问其他页面
      if (useStore.username) {
        next()
      } else {
        try {
          // 获取用户信息
          await useStore.userInfo()
          next()
        } catch (error) {
          // token 过期或无效
          useStore.userLogout()  // 清空用户数据
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    // 未登录
    if (to.path === '/login' || to.path === '/404') {
      next()
    } else {
      // 其他页面都跳转到登录页
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})
```

### 5. Mock 登录接口（api/api.ts）

```typescript
/**
 * 本地 Mock 登录
 * 支持账号: admin (密码: 111111), user (密码: 123456)
 */
const mockLogin = async (credentials: ReqLogin): Promise<ItypeAPI<any>> => {
  await mockDelay(500)  // 模拟网络延迟
  
  const username = credentials.userName || credentials.name
  const password = credentials.passWord || credentials.paw
  
  // 验证账号密码
  const userInfo = MOCK_USERS[username]
  if (!userInfo || userInfo.password !== password) {
    return {
      code: 401,
      msg: '账号或密码错误',
      data: null
    }
  }
  
  // 返回成功响应
  return {
    code: 200,
    msg: '登录成功',
    data: {
      token: userInfo.token,
      username: userInfo.user.username
    }
  }
}

/**
 * 公开的登录接口
 */
export const reqLogin = async (params: ReqLogin) => {
  // 使用 mock 数据（本地测试）
  return mockLogin(params)
  
  // 也可以切换到真实接口：
  // return request({ url: '/test', method: 'post', params })
}
```

---

## 🔐 数据流向

### 登录流程

```
登录页面 (login/index.vue)
    ↓
用户输入账号/密码，点击登录
    ↓
调用 userStore.userLogin(data)
    ↓
调用 reqLogin(data) → Mock 或真实 API
    ↓
验证成功 → 返回 token
    ↓
保存到 Pinia store.token
    ↓
保存到 localStorage (KEY: 'TOKEN')
    ↓
跳转到首页 (/)
    ↓
权限守卫检查 → 有 token → 放行
```

### 退出流程

```
首页 (home/index.vue)
    ↓
点击头部栏"退出"按钮 (headBar/index.vue)
    ↓
弹出确认对话框
    ↓
用户确认退出
    ↓
调用 userStore.userLogout()
    ↓
清空 store 中的所有状态：
  - token = ''
  - username = ''
  - avatar = ''
  - fold = false
    ↓
清空 localStorage 中的 TOKEN
    ↓
显示成功提示
    ↓
延迟 500ms 后路由跳转
    ↓
新路由：/login?redirect=/home
    ↓
权限守卫检查 → 无 token → 直接进入登录页
```

---

## 🛠️ 扩展指南

### 场景 1：切换到真实后端接口

**修改** `src/api/api.ts` 中的 `reqLogin` 函数：

```typescript
export const reqLogin = async (params: ReqLogin) => {
  // 注释掉 mock
  // return mockLogin(params)
  
  // 启用真实接口
  return request({
    url: '/api/login',
    method: 'post',
    data: params
  })
}
```

### 场景 2：退出前调用后端接口

**修改** `src/store/home.ts` 中的 `userLogout` 方法：

```typescript
async userLogout() {
  try {
    // 可选：调用后端退出接口
    // await request({
    //   url: '/api/logout',
    //   method: 'post',
    //   headers: {
    //     'Authorization': 'Bearer ' + this.token
    //   }
    // })
    
    // 清空本地数据
    this.token = ''
    this.username = ''
    this.avatar = ''
    this.fold = false
    REMOVE_TOKEN()
    
    return Promise.resolve()
  } catch (error) {
    // 即使退出接口失败，也要清空本地数据
    this.token = ''
    this.username = ''
    this.avatar = ''
    REMOVE_TOKEN()
    return Promise.reject(error)
  }
}
```

### 场景 3：自定义退出逻辑

在任何页面调用退出：

```typescript
import useUserStore from '@/store/home'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const logout = async () => {
  // 清空用户信息
  await userStore.userLogout()
  
  // 自定义业务逻辑...
  
  // 跳转到登录页或其他页面
  router.push('/login')
}
```

### 场景 4：清空其他存储数据

**修改** `src/store/home.ts` 中的 `userLogout` 方法：

```typescript
userLogout() {
  // 清空 Pinia store
  this.token = ''
  this.username = ''
  this.avatar = ''
  this.fold = false
  
  // 清空本地存储
  REMOVE_TOKEN()
  localStorage.removeItem('user_info')
  localStorage.removeItem('app_settings')
  
  // 清空会话存储
  sessionStorage.clear()
  
  // 关闭 WebSocket 连接等其他操作...
  
  return Promise.resolve()
}
```

---

## 🧪 测试检查清单

在部署到生产环境前，请检查以下项目：

- [ ] **登录测试**
  - [ ] 使用正确的账号密码可以成功登录
  - [ ] 使用错误的账号密码显示错误提示
  - [ ] 登录后自动跳转到首页或指定页面

- [ ] **退出测试**
  - [ ] 点击退出按钮显示确认对话框
  - [ ] 点击"确定"成功退出，显示成功提示
  - [ ] 点击"取消"取消退出，留在原页面
  - [ ] 退出后跳转到登录页面

- [ ] **数据清空测试**
  - [ ] 打开浏览器开发者工具 (F12)
  - [ ] 进入 Application → Local Storage
  - [ ] 登录前：无 TOKEN
  - [ ] 登录后：有 TOKEN
  - [ ] 退出后：TOKEN 被删除

- [ ] **权限管理测试**
  - [ ] 未登录情况下访问主页自动跳转到登录页
  - [ ] 登录后访问登录页自动跳转到首页
  - [ ] 登录状态下访问页面可以正常浏览
  - [ ] 手动删除 localStorage 中的 TOKEN 后，刷新页面自动跳转到登录页

- [ ] **页面转跳测试**
  - [ ] 退出登录后点击浏览器后退按钮不能回到首页
  - [ ] 登录后记录原访问路径，退出后返回该路径需要重新登录

---

## 📊 状态管理细节

### Pinia Store 状态

```typescript
state: {
  username: 'libieke',              // 用户名
  avatar: '',                       // 用户头像
  fold: false,                      // 菜单展开/折叠状态
  token: GET_TOKEN(),               // 用户 Token（从本地存储读取）
}
```

### 状态更新时间线

```
初始化:          token = localStorage.getItem('TOKEN') || ''
登录成功:        token = '新token值' → 写入 localStorage
退出登录:        token = '' → 删除 localStorage 中的 TOKEN
刷新页面:        token = localStorage.getItem('TOKEN') || ''
路由守卫检查:    if (token) { ... }
```

---

## ⚠️ 常见问题

### Q1: 退出后仍然能访问其他页面？

**原因**：可能 token 在本地存储和 Pinia store 之间不同步。

**解决**：
```typescript
// 在路由守卫中同步状态
let token = useStore.token || GET_TOKEN()
```

### Q2: 刷新页面后登录状态丢失？

**原因**：刷新时 Pinia 状态会重置，需要从本地存储恢复。

**解决**：在 `store/home.ts` 中：
```typescript
state: () => {
  return {
    token: GET_TOKEN(),  // 从本地存储初始化
    // ...
  }
}
```

### Q3: 退出按钮点不了或没有反应？

**原因**：可能没有正确导入依赖。

**检查**：
```typescript
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter, useRoute } from "vue-router"
```

### Q4: 我想要不同的确认文案？

**修改** `src/components/headBar/index.vue` 中的对话框配置：

```typescript
ElMessageBox.confirm(
  "您确定要离开吗？未保存的内容将丢失。",  // 修改这里
  "提示",  // 修改这里
  {
    confirmButtonText: "退出",  // 修改这里
    cancelButtonText: "留下",    // 修改这里
    type: "warning",
  }
)
```

---

## 🎯 最佳实践

1. **始终通过 store 退出**
   ```typescript
   // ✅ 推荐
   await userStore.userLogout()
   
   // ❌ 不推荐（不会清空 Pinia 状态）
   REMOVE_TOKEN()
   ```

2. **退出后延迟跳转**
   ```typescript
   // ✅ 让用户看到成功提示再跳转
   setTimeout(() => {
     router.push('/login')
   }, 500)
   
   // ❌ 立即跳转
   router.push('/login')
   ```

3. **处理退出时的错误**
   ```typescript
   // ✅ 即使出错也要清空本地数据
   try {
     await backendLogout()
   } finally {
     userStore.userLogout()
   }
   ```

4. **使用 query 参数记录原路径**
   ```typescript
   // ✅ 退出后记录原路径，用户可以登录后回到原位置
   router.push({
     path: '/login',
     query: { redirect: route.path }
   })
   ```

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| [src/components/headBar/index.vue](src/components/headBar/index.vue) | 退出按钮和逻辑 |
| [src/store/home.ts](src/store/home.ts) | 登录/退出 store |
| [src/utils/token.ts](src/utils/token.ts) | Token 管理 |
| [src/permission.ts](src/permission.ts) | 权限守卫 |
| [src/api/api.ts](src/api/api.ts) | API 接口和 Mock 数据 |
| [src/view/login/index.vue](src/view/login/index.vue) | 登录页面 |

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台的错误信息（F12）
2. 确保所有依赖已正确安装
3. 确保使用了正确的账号密码
4. 清除浏览器缓存后重试

**祝您使用愉快！** ✨
