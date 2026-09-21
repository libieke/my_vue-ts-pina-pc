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
          roles: ["admin", "user"],
        },
      },
      {
        path: "userList",
        component: () => import("@/view/userList/index.vue"),
        meta: {
          isShow: true,
          title: "用户列表",
          icon: "menu-list",
          roles: ["admin"],
        },
      },
      {
        path: "userSet",
        component: () => import("@/view/userSet/index.vue"),
        meta: {
          isShow: true,
          title: "用户设置",
          icon: "menu-user",
          roles: ["admin"],
        },
      },
      {
        path: "orderManage",
        component: () => import("@/view/orderManage/index.vue"),
        meta: {
          isShow: true,
          title: "订单管理",
          icon: "menu-order",
          roles: ["admin"],
        },
      },
      {
        path: "dataAnalysis",
        component: () => import("@/view/dataAnalysis/index.vue"),
        meta: {
          isShow: true,
          title: "数据分析",
          icon: "menu-chart",
          roles: ["admin"],
        },
      },
      {
        path: "messageNotice",
        component: () => import("@/view/messageNotice/index.vue"),
        meta: {
          isShow: true,
          title: "消息通知",
          icon: "menu-message",
          roles: ["admin"],
        },
      },
      {
        path: "docCenter",
        component: () => import("@/view/docCenter/index.vue"),
        meta: {
          isShow: true,
          title: "文档中心",
          icon: "menu-doc",
          roles: ["admin"],
        },
      },
      {
        path: "fileManage",
        component: () => import("@/view/fileManage/index.vue"),
        meta: {
          isShow: true,
          title: "文件管理",
          icon: "menu-file",
          roles: ["admin"],
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
  const userRole = userStore.role || localStorage.getItem('USER_ROLE') || 'user';
  const areaCode = to.query.areaCode;

  if (token && userName) {
    const payload = {
      userName,
      userRole,
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

  const routeRoles = to.meta?.roles as string[] | undefined;
  if (routeRoles && !routeRoles.includes(userRole)) {
    next({ path: "/home" });
    return;
  }

  next();
});

export default router;
