<template>
  <div class="header">
    <div class="top-box">
      <div class="left">
        <!-- <img src="@/assets/pictrue/loginbg.png" width="100%" height="60" /> -->
        <span>我的管理平台</span>
      </div>
      <div class="right">
        <div class="avatar padding-r-10">
          <el-avatar :src="avatar" :size="38" />
        </div>
        <div class="name padding-r-20">{{ username }}</div>
        <div class="time padding-r-20">{{ nowTime }}</div>
        <div class="logout padding-r-10" @click="loguot">退出</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseTime } from "@/utils/utils.js";
import useUserStore from "@/store/home";
let useStore = useUserStore();
let $router = useRouter();
let $route = useRoute();
let avatar = ref("/src/assets/pictrue/avatar.png");
let username = ref();
username.value = useStore.username;
let nowTime = ref("");
onMounted(() => {
  setInterval(() => {
    nowTime.value = parseTime(new Date());
  });
});

const loguot = () => {
  useStore.userLogout();
  // 第三件事情：跳转到登录页面，通过query参数传递退出登录前的路径
  $router.push({ path: "/login", query: { redirect: $route.path } });
};
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  background: #fff;
  box-shadow: 0 6px 8px 0 rgba(178, 179, 182, 0.25);
}
.top-box {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #000;
  // padding: 0 20px;

  .left {
    font-size: 24px;
    line-height: 60px;
    width: 199px;
    height: 60px;
    overflow: hidden;
    text-align: center;
    color: #fff;
    // background-color: #1F3A8A;
    background: linear-gradient(180deg, #0f172a 0%, #134c66 100%);
  }
  .right {
    display: flex;
    align-items: center;
    font-size: 16px;
    .avatar {
      padding-top: 5px;
    }
    .name {
      font-size: 16px;
    }
    .time {
      font-size: 12px;
    }
    .logout {
      font-size: 14px;
      color: #333;
      &:hover {
        color: #999;
        cursor: pointer;
      }
    }
  }
}
</style>
