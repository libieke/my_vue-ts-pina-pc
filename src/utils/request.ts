import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
// import { getToken } from '@/utils/auth'
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as any, // api 的 base_url
  // baseURL: 'http://192.168.1.104:8999/', // api 的 base_url
  timeout: 5000, // request timeout
})
// request interceptor
service.interceptors.request.use(
  (config: any) => {
    // let token: string = ''//此处换成自己获取回来的token，通常存在在cookie或者store里面
    // if (token) {
    //   // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
    //   config.headers['X-Token'] = token

    //   config.headers.Authorization = + token
    // }
    return config
  },
  error => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// 统一处理接口返回数据，避免后端返回 null / undefined / 空对象时导致前端直接报错
// 常见场景：返回 { data: [] }、{ list: [] } 或直接返回 []，都能安全兜底成可渲染数据
const normalizeResponseData = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.list)) return payload.list
    return payload
  }
  return payload ?? []
}

// response interceptor
service.interceptors.response.use(
  (response: any) => {
    return normalizeResponseData(response?.data)
  },
  error => {
    const status = error?.response?.status
    if (status == 403) {
      ElMessage.error('错了')
    } else {
      ElMessage.error('服务器请求错误，请稍后再试')
    }
    return Promise.reject(error)
  }
)


export default service
