import router from '@/routes/index'
import setting from '@/setting'
import { GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
// @ts-ignore
import nprogress from 'nprogress'
import "nprogress/nprogress.css"
nprogress.configure({ showSpinner: false })
import useUserStore from '@/store/home'

const useStore = useUserStore()

router.beforeEach(async (to: any, _from: any, next: any) => {
  nprogress.start()
  
  let token = useStore.token || GET_TOKEN()
  
  let username = useStore.username

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (username) {
        next()
      } else {
        try {
          await useStore.userInfo()
          next()
        } catch (error) {
          console.error('获取用户信息失败:', error)
          useStore.userLogout()
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    if (to.path === '/login' || to.path === '/404') {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})

router.afterEach((to: any) => {
  document.title = `${setting.title} - ${to.meta.title || '页面'}`
  nprogress.done()
})