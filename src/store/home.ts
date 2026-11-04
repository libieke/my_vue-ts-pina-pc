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
  state: () => {
    return {
      username: userInfo.username || '',
      avatar: userInfo.avatar || '',
      role: userRole,
      fold: false,
      token: GET_TOKEN(),
    }
  },
  getters: {

  },
  actions: {
    async userLogin(data: any) {
      let result: any = await reqLogin(data)
      console.log('登录响应:', result)
      
      if (result.code === 200) {
        const loginRole = (result.data?.role || this.username || result.data?.username || '').toLowerCase() === 'admin' ? 'admin' : 'user'
        this.token = result.data.token
        this.username = result.data.username
        this.avatar = result.data.avatar || '/src/assets/pictrue/avatar.png'
        this.role = loginRole
        SET_TOKEN(result.data.token as string)
        SET_USER_INFO({ username: this.username, avatar: this.avatar })
        SET_USER_ROLE(this.role)
        return Promise.resolve('ok')
      } else {
        return Promise.reject(new Error(result.msg || '登录失败'))
      }
    },
    async userInfo() {
      let result: any = await reqUserInfo()
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
      this.token = ''
      this.username = ''
      this.avatar = ''
      this.role = 'user'
      this.fold = false
      
      REMOVE_TOKEN()
      REMOVE_USER_INFO()
      REMOVE_USER_ROLE()
      
      const tagsStore = useTagsStore()
      tagsStore.delAllViews()
      
      
      return Promise.resolve()
    }

  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}


export default useUserStore