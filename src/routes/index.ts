import { createRouter, createWebHistory } from "vue-router";
import layout from "@/view/layout/index.vue";
import useUserStore from "@/store/home";

export const constantRoutes = [
  {
    path: "/:catchAll(.*)",
    component: () => import("@/components/404/index.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/view/login/index.vue"),
  },
  {
    path: "/",
    component: layout,
    redirect: "/home",
    children: [
      {
        path: "home",
        component: () => import("@/view/home/index.vue"),
        meta: {
          isShow: true,
          title: "首页",
          icon: "menu-home",
        },
      },
      {
        path: "userList",
        component: () => import("@/view/userList/index.vue"),
        meta: {
          isShow: true,
          title: "用户列表",
          icon: "menu-list",
        },
      },
      {
        path: "userSet",
        component: () => import("@/view/userSet/index.vue"),
        meta: {
          isShow: true,
          title: "用户设置",
          icon: "menu-user",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    };
  },
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;
  const userName = userStore.username;
  const areaCode = to.query.areaCode;

  // 检查是否真的已登录（既有 token 又有 username）
  if (token && userName) {
    const payload = {
      userName,
      areaCode,
    };
    // 这里可以继续接登录态校验逻辑
    // await store.dispatch('LOGINWITHTOKEN', payload)
    console.log("route payload", payload);
  }

  // 未登录的情况：没有 token 或 username，且当前路由不是登录页
  if ((!token || !userName) && to.path !== "/login") {
    next("/login");
  } else {
    next();
  }
});

export default router;
