
<template>
  <div class="header">
    <div class="top-box">
      <div class="left">
        <span>{{ $t('header.platform') }}</span>
      </div>
      <div class="right">
        <div class="avatar padding-r-10">
          <el-avatar :src="avatar" :size="38" />
        </div>
        <div class="name padding-r-20">{{ username }}</div>
        <div class="time padding-r-20">{{ nowTime }}</div>
        <div class="logout padding-r-10" @click="toggleLang">
          {{ locale === 'zh-CN' ? 'EN' : '中文' }}
        </div>
        <div class="logout padding-r-10" @click="handleLogout">
          <el-icon style="margin-right: 4px;"><SwitchButton /></el-icon>
          {{ $t('header.logout') }}
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
import avatarImg from "@/assets/pictrue/avatar.png";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/lang";

const { t, locale } = useI18n();

const toggleLang = () => {
  setLocale(locale.value === "zh-CN" ? "en" : "zh-CN");
};

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

const handleLogout = () => {
  ElMessageBox.confirm(
    t("header.logoutConfirm"),
    t("header.logoutTitle"),
    {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await userStore.userLogout();
        
        ElMessage.success(t("header.logoutSuccess"));
        
        setTimeout(() => {
          $router.push({
            path: "/login",
            query: { redirect: $route.path },
          });
        }, 500);
      } catch (error) {
        ElMessage.error(t("header.logoutFailed"));
        console.error("退出登录出错:", error);
      }
    })
    .catch(() => {
      ElMessage.info(t("header.logoutCancelled"));
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

  .left {
    font-size: 24px;
    line-height: 60px;
    width: 199px;
    height: 60px;
    overflow: hidden;
    text-align: center;
    color: #fff;
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
