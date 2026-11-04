import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as any,
  timeout: 5000,
})
service.interceptors.request.use(
  (config: any) => {

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const normalizeResponseData = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.list)) return payload.list
    return payload
  }
  return payload ?? []
}

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
