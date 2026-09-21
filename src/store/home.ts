import { defineStore, acceptHMRUpdate } from "pinia";

import type { loginResponseData } from '@/api/type'
import type { UserState } from './types/type'
import {
  SET_TOKEN,
  GET_TOKEN,
  REMOVE_TOKEN,
  SET_USER_INFO,
  GET_USER_INFO,
  REMOVE_USER_INFO,
  SET_USER_ROLE,
  GET_USER_ROLE,
  REMOVE_USER_ROLE,
} from '@/utils/token'
import { reqLogin, reqUserInfo } from '@/api/api'
import useTagsStore from '@/store/tags'

const userInfo = GET_USER_INFO()
const userRole = GET_USER_ROLE()

const useUserStore = defineStore("user", {
  // id: 
  state: () => {
    return {
      username: userInfo.username || '',
      avatar: userInfo.avatar || '',
      role: userRole,
      fold: false, // 用户控制菜单折叠还是收起
      token: GET_TOKEN(),//存储用户唯一标识,本地存储持久化token
    }
  },
  getters: {

  },
  actions: {
    async userLogin(data: any) {
      // 调用登录接口
      let result: any = await reqLogin(data)
      console.log('登录响应:', result)
      
      // 登录成功（code === 200）
      if (result.code === 200) {
        const loginRole = (result.data?.role || this.username || result.data?.username || '').toLowerCase() === 'admin' ? 'admin' : 'user'
        // 保存 token 到 Pinia store
        this.token = result.data.token
        // 保存 username 到 Pinia store
        this.username = result.data.username
        this.avatar = result.data.avatar || '/src/assets/pictrue/avatar.png'
        this.role = loginRole
        // 保存到本地存储（持久化）
        SET_TOKEN(result.data.token as string)
        SET_USER_INFO({ username: this.username, avatar: this.avatar })
        SET_USER_ROLE(this.role)
        // 返回成功标识
        return Promise.resolve('ok')
      } else {
        // 登录失败
        return Promise.reject(new Error(result.msg || '登录失败'))
      }
    },
    async userInfo() {
      // 获取用户信息进行存储仓库当中（用户头像、名字）
      let result: any = await reqUserInfo()
      // 如果获取信息成功，存储下用户信息
      if (result.code === 200) {
        this.username = result.data.checkUser.username
        this.avatar = result.data.checkUser.avatar
        this.role = this.username === 'admin' ? 'admin' : 'user'
        SET_USER_INFO({ username: this.username, avatar: this.avatar })
        SET_USER_ROLE(this.role)
      } else {
        throw new Error(result.msg || '获取用户信息失败')
      }
    },

    userLogout() {
      // 退出登录：清空所有用户信息和token
      // 1. 清空 Pinia store 中的状态
      this.token = ''
      this.username = ''
      this.avatar = ''
      this.role = 'user'
      this.fold = false
      
      // 2. 清空本地存储中的 token 和用户信息
      REMOVE_TOKEN()
      REMOVE_USER_INFO()
      REMOVE_USER_ROLE()
      
      // 3. 清空标签页，只保留首页
      const tagsStore = useTagsStore()
      tagsStore.delAllViews()
      
      // 4. 可选：清空其他相关存储
      // localStorage.removeItem('user_info')
      // sessionStorage.clear()
      
      return Promise.resolve()
    }

  }
});

// Pinia 是 vuex 新替代方案。Pinia 中热更新实现，借助 import.meta
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}


export default useUserStore