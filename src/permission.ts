// 路由鉴权：项目中能不能被访问的权限设置（某一个路由什么条件下可以访问，什么条件下不可以访问）
import router from '@/routes/index'
import setting from '@/setting'
import { GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
// @ts-ignore
import nprogress from 'nprogress'
// 引入进度条样式
import "nprogress/nprogress.css"
nprogress.configure({ showSpinner: false })
// 获取用户相关的小仓库内部token数据，去判断用户是否登录成功
import useUserStore from '@/store/home'

const useStore = useUserStore()

// 全局守卫：项目中任意路由切换都会触发的钩子
// 全局前置守卫
router.beforeEach(async (to: any, _from: any, next: any) => {
  // to：你将要访问哪个路由
  // from：你从哪个路由而来
  // next：路由的放行函数
  // 进度条开始
  nprogress.start()
  
  // 获取token，去判断用户登录，还是未登录
  let token = useStore.token || GET_TOKEN()
  
  // 获取用户名字
  let username = useStore.username

  // 用户已登录的情况下
  if (token) {
    // 情况1：已登录，不能访问login，跳转到首页
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 情况2：已登录，访问其他路由
      // 情况2.1：已有用户信息，直接放行
      if (username) {
        next()
      } else {
        // 情况2.2：没有用户信息，发请求获取用户信息再放行
        try {
          // 获取用户信息（如果有后端接口的话）
          await useStore.userInfo()
          // 放行
          next()
        } catch (error) {
          // 获取用户信息失败：可能是 token 过期、被篡改或服务器异常
          console.error('获取用户信息失败:', error)
          // 清空用户数据
          useStore.userLogout()
          // 重新跳转到登录页面
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    // 用户未登录的情况下
    // 未登录只能访问 login 和 404 页面
    if (to.path === '/login' || to.path === '/404') {
      next()
    } else {
      // 其他页面都跳转到登录页，并记录原来要访问的路径
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})

// 全局后置守卫
router.afterEach((to: any) => {
  document.title = `${setting.title} - ${to.meta.title || '页面'}`
  // 进度条结束
  nprogress.done()
})