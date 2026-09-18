<template>
  <div class="login">
    <div class="login-box">
      <div class="left">
        <div>
          您好！欢迎进入<br />
          我的工作台
        </div>
        <div class="subtitle">模板</div>
      </div>
      <div class="right">
        <el-card class="box-card">
          <div class="title">欢迎登陆</div>
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
                  placeholder="请输入账号"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="passWord">
                <el-input
                  type="password"
                  prefix-icon="Lock"
                  v-model="formData.passWord"
                  placeholder="请输入密码"
                >
                </el-input>
              </el-form-item>
              <!-- <el-form-item>
                <div class="authCode-box">
                  <el-input
                    @input="
                      formData.authCode = formData.authCode.replace(
                        /[^\d]/g,
                        ''
                      )
                    "
                    v-model="formData.authCode"
                    placeholder="请输入验证码"
                  >
                  </el-input>
                  <div class="authCode">
                    <img src="./../assets/images/loginbg.png" />
                  </div>
                </div>
              </el-form-item> -->
              <el-form-item>
                <el-button
                  class="submint-but"
                  type="primary"
                  @click="onSubmit(loginFroms)"
                  >登录</el-button
                >
                <!-- <el-checkbox v-model="isRemember">记住密码</el-checkbox> -->
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

const rules = reactive<FormRules<RuleForm>>({
  userName: [
    {
      required: true,
      min: 4,
      max: 10,
      message: "用户名长度应为5-10位",
      trigger: "change",
    },
  ],
  passWord: [
    {
      required: true,
      min: 5,
      max: 10,
      message: "密码长度应为6-10位",
      trigger: "change",
    },
  ],
});

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log("submit!");
      // 加载效果：开始加载
      loading.value = true;
      // 成功的话到首页，失败的话弹出失败信息
      try {
        // 等待登录接口返回结果
        await useStore.userLogin(formData);

        // 登陆成功提示
        ElNotification({
          type: "success",
          message: "登陆成功",
        });

        let redirect: any = $route.query.redirect;
        $router.push({ path: redirect || "/" });

        // 登录成功加载效果消失
        loading.value = false;
      } catch (error) {
        // 登录失败加载效果消失
        loading.value = false;
        // 登录失败的提示信息
        ElNotification({
          type: "error",
          message: (error as Error).message || "登录失败，请检查账号密码",
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
      /* or 133% */

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
        /* identical to box height */

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
        // ::v-deep (.el-input__prefix) {
        //   color: #000;
        //   font-size: 14px;
        // }
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
