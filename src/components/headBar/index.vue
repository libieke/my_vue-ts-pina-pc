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
        <div class="logout padding-r-10" @click="handleLogout">
          <el-icon style="margin-right: 4px;"><SwitchButton /></el-icon>
          退出
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseTime } from "@/utils/utils.js";
import useUserStore from "@/store/home";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SwitchButton } from "@element-plus/icons-vue";
// 导入头像图片
import avatarImg from "@/assets/pictrue/avatar.png";

const userStore = useUserStore();
const $router = useRouter();
const $route = useRoute();

let avatar = ref(avatarImg);
let username = ref("");
username.value = userStore.username;
let nowTime = ref("");

onMounted(() => {
  setInterval(() => {
    nowTime.value = parseTime(new Date());
  });
});

/**
 * 处理退出登录
 * 1. 显示确认对话框
 * 2. 清空用户信息和 token
 * 3. 跳转到登录页面
 */
const handleLogout = () => {
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
        // 调用 store 中的退出登录方法，清空所有用户信息
        await userStore.userLogout();
        
        ElMessage.success("退出登录成功");
        
        // 延迟 500ms 后跳转，让用户看到成功提示
        setTimeout(() => {
          // 跳转到登录页面，并传递当前路径作为 redirect 参数（用户可以登录后返回原页面）
          $router.push({
            path: "/login",
            query: { redirect: $route.path },
          });
        }, 500);
      } catch (error) {
        ElMessage.error("退出登录失败，请重试");
        console.error("退出登录出错:", error);
      }
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
      ElMessage.info("已取消退出");
    });
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
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      
      &:hover {
        color: #f56c6c;
        transform: scale(1.05);
      }
    }
  }
}
</style>
