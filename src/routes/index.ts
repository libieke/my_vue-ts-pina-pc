<<<<<<< HEAD
import { createRouter, createWebHistory } from "vue-router";
import layout from '@/view/layout/index.vue';
import Cookies from "js-cookie"
import { storeToRefs } from "pinia";
import useUserStore from '@/store/home'

export const constantRoutes = [
  {
    path: '/:catchAll(.*)',
    component: () => import('@/components/404/index.vue'),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/view/login/index.vue"),
  },
  {
    path: '/',
    component: layout,
    redirect: '/home',
    children: [
      {
        path: "home",
        component: () => import("@/view/home/index.vue"),
        meta: {
          isShow: true,
          title: '首页',
          icon: 'menu-home',
        }
      },
      {
        path: "userList",
        component: () => import("@/view/userList/index.vue"),
        meta: {
          isShow: true,
          title: '用户列表',
          icon: 'menu-list',
        }
      },
      {
        path: "userSet",
        component: () => import("@/view/userSet/index.vue"),
        meta: {
          isShow: true,
          title: '用户设置',
          icon: 'menu-user',
        }
      },
    ],
  },

]

// import.meta.env.BASE_URL 是 Vite 内置变量，自动等于 vite.config.ts 的 base
// 开发时为 '/'，生产时为 '/my_vue-ts-pina-pc/'，两边自动同步
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior() {
    return {
      left: 0,
      top: 0
    }
  }
})


router.beforeEach((to, _from, next) => {
  const store = useUserStore
  const userName = store.name
  // const access_token = to.query.token
  const areaCode = to.query.areaCode
  if (userName) {
    let payload = {
      userName,
      areaCode
    }
    // await store.dispatch('LOGINWITHTOKEN', payload)
  }
  // const userInfo = store.state.user.info;
  if (!userName && to.path !== "/login") {
    next("/login");
  } else {
    next();
  }
})

router.afterEach(() => {
})

// 导出
export default router
=======
import { createRouter, createWebHistory } from "vue-router";
import layout from '@/view/layout/index.vue';
import Cookies from "js-cookie"
import { storeToRefs } from "pinia";
import useUserStore from '@/store/home'

export const constantRoutes = [
  {
    path: '/:catchAll(.*)',
    component: () => import('@/components/404/index.vue'),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/view/login/index.vue"),
  },
  {
    path: '/',
    component: layout,
    redirect: '/home',
    children: [
      {
        path: "home",
        component: () => import("@/view/home/index.vue"),
        meta: {
          isShow: true,
          title: '首页',
          icon: 'menu-home',
        }
      },
      {
        path: "userList",
        component: () => import("@/view/userList/index.vue"),
        meta: {
          isShow: true,
          title: '用户列表',
          icon: 'menu-list',
        }
      },
      {
        path: "userSet",
        component: () => import("@/view/userSet/index.vue"),
        meta: {
          isShow: true,
          title: '用户设置',
          icon: 'menu-user',
        }
      },
    ],
  },

]

// 添加动态路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior() {
    return {
      left: 0,
      top: 0
    }
  }
})


router.beforeEach((to, _from, next) => {
  const store = useUserStore
  const userName = store.name
  // const access_token = to.query.token
  const areaCode = to.query.areaCode
  if (userName) {
    let payload = {
      userName,
      areaCode
    }
    // await store.dispatch('LOGINWITHTOKEN', payload)
  }
  // const userInfo = store.state.user.info;
  if (!userName && to.path !== "/login") {
    next("/login");
  } else {
    next();
  }
})

router.afterEach(() => {
})

// 导出
export default router 
>>>>>>> 73825f3c91ca5d8a1357d80104b34537d14e3b45
