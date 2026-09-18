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
  const token = userStore.token || localStorage.getItem('TOKEN');
  const userName = userStore.username || JSON.parse(localStorage.getItem('USER_INFO') || '{"username":""}').username;
  const areaCode = to.query.areaCode;

  if (token && userName) {
    const payload = {
      userName,
      areaCode,
    };
    console.log("route payload", payload);
  }

  if (token && to.path === "/login") {
    next({ path: "/" });
    return;
  }

  if (!token && to.path !== "/login") {
    next({ path: "/login", query: { redirect: to.path } });
    return;
  }

  next();
});

export default router;
