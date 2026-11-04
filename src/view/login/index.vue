
<template>
  <div class="login">
    <div class="login-box">
      <div class="left">
        <div>
          {{ $t('login.welcome') }}<br />
          {{ $t('login.workspace') }}
        </div>
        <div class="subtitle">{{ $t('login.subtitle') }}</div>
      </div>
      <div class="right">
        <el-card class="box-card">
          <div class="title">{{ $t('login.cardTitle') }}</div>
          <div class="login-from">
            <el-form
              auto-complete="new-password"
              class="form-box"
              ref="loginFroms"
              :model="formData"
              :rules="rules"
            >
              <el-form-item prop="userName">
                <el-input
                  prefix-icon="User"
                  v-model="formData.userName"
                  :placeholder="$t('login.accountPlaceholder')"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="passWord">
                <el-input
                  type="password"
                  prefix-icon="Lock"
                  v-model="formData.passWord"
                  :placeholder="$t('login.passwordPlaceholder')"
                >
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="submint-but"
                  type="primary"
                  @click="onSubmit(loginFroms)"
                  >{{ $t('login.submit') }}</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, FormRules, FormInstance } from "element-plus";
import useUserStore from "@/store/home";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

let useStore = useUserStore();
let $router = useRouter();
let loading = ref(false);
let $route = useRoute();

let formData = reactive({
  userName: "admin",
  passWord: "111111",
});
interface RuleForm {
  userName: string;
  passWord: string;
}
let loginFroms = ref();

const rules = computed<FormRules<RuleForm>>(() => ({
  userName: [
    {
      required: true,
      min: 4,
      max: 10,
      message: t("login.accountRule"),
      trigger: "change",
    },
  ],
  passWord: [
    {
      required: true,
      min: 5,
      max: 10,
      message: t("login.passwordRule"),
      trigger: "change",
    },
  ],
}));

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log("submit!");
      loading.value = true;
      try {
        await useStore.userLogin(formData);

        ElNotification({
          type: "success",
          message: t("login.success"),
        });

        let redirect: any = $route.query.redirect;
        $router.push({ path: redirect || "/" });

        loading.value = false;
      } catch (error) {
        loading.value = false;
        ElNotification({
          type: "error",
          message: (error as Error).message || t("login.failed"),
        });
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>
<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100vh;
  background-size: 100% 100%;
  display: flex;
  background: url("@/assets/pictrue/loginbg.png") no-repeat;

  justify-content: center;
  align-items: center;
  .login-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 80%;
    height: 60%;
    .left {
      width: 60%;
      height: 100%;
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 72px;
      line-height: 96px;

      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .subtitle {
        font-style: normal;
        font-weight: 200;
        font-size: 24px;
        line-height: 34px;

        color: rgba(255, 255, 255, 0.6);
        margin-top: 100px;
      }
    }
    .right {
      width: 500px;
      height: 100%;

      .box-card {
        width: 90%;
        margin: 0 auto;
      }
      .title {
        color: #327ff1;
        font-size: 36px;
        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 600;
        letter-spacing: 4px;
        text-align: center;
        margin-top: 20px;
      }
      .login-from {
        padding: 0 20px;
        margin-top: 46px;
        .submint-but {
          font-size: 20px;
          letter-spacing: 6px;
          width: 100%;
          height: 56px;
          background: #327ff1;
          box-shadow: 0px 4px 12px -10px rgba(50, 126, 241, 0.44) !important;
          border-radius: 4px;
          margin-top: 40px;
          margin-bottom: 16px;
        }
      }
      .authCode-box {
        display: flex;
        flex-direction: row;
        .authCode {
          width: 72px;
          height: 36px;
          margin-left: 20px;
          > img {
            width: inherit;
            height: inherit;
          }
        }
      }
    }
  }
}
</style>
