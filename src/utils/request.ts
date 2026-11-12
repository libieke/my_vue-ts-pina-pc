import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import {
  GET_REFRESH_TOKEN,
  GET_TOKEN,
  REMOVE_REFRESH_TOKEN,
  REMOVE_TOKEN,
  SET_REFRESH_TOKEN,
  SET_TOKEN,
} from '@/utils/token'

const getRuntimeEnv = () => {
  const globalEnv = (globalThis as any).__APP_ENV__ ?? {}
  try {
    const viteEnv = Function('return (typeof import.meta !== "undefined" ? import.meta.env : {})')()
    return { ...globalEnv, ...viteEnv }
  } catch {
    return globalEnv
  }
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

const getTokenFromPayload = (payload: any): string | null => {
  if (!payload || typeof payload !== 'object') return null
  if (typeof payload.token === 'string' && payload.token) return payload.token
  if (typeof payload.accessToken === 'string' && payload.accessToken) return payload.accessToken
  if (payload.data && typeof payload.data === 'object') {
    return getTokenFromPayload(payload.data)
  }
  return null
}

const getRefreshTokenFromPayload = (payload: any): string | null => {
  if (!payload || typeof payload !== 'object') return null
  if (typeof payload.refreshToken === 'string' && payload.refreshToken) return payload.refreshToken
  if (typeof payload.refresh_token === 'string' && payload.refresh_token) return payload.refresh_token
  if (payload.data && typeof payload.data === 'object') {
    return getRefreshTokenFromPayload(payload.data)
  }
  return null
}

const redirectToLogin = () => {
  const currentPath = window.location.pathname
  if (currentPath !== '/login') {
    window.location.href = '/login'
  }
}

const clearLoginState = () => {
  REMOVE_TOKEN()
  REMOVE_REFRESH_TOKEN()
}

const refreshAccessToken = async () => {
  const refreshToken = GET_REFRESH_TOKEN()
  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN')
  }

  const runtimeEnv = getRuntimeEnv()
  const refreshUrl = (runtimeEnv.VITE_REFRESH_URL as string | undefined) || '/auth/refresh'
  const response = await axios.post(refreshUrl, { refreshToken }, {
    baseURL: runtimeEnv.VITE_API_URL as any,
    timeout: 5000,
  })

  const payload = response?.data ?? response
  const newAccessToken = getTokenFromPayload(payload)
  const nextRefreshToken = getRefreshTokenFromPayload(payload) ?? refreshToken

  if (!newAccessToken) {
    throw new Error('REFRESH_TOKEN_FAILED')
  }

  SET_TOKEN(newAccessToken)
  SET_REFRESH_TOKEN(nextRefreshToken)
  return newAccessToken
}

const service: AxiosInstance = axios.create({
  baseURL: getRuntimeEnv().VITE_API_URL as any,
  timeout: 5000,
})

service.interceptors.request.use(
  (config: any) => {
    const token = GET_TOKEN()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
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

export const handleResponseError = async (error: any) => {
  const status = error?.response?.status
  const originalRequest = error?.config

  if (status === 401 && originalRequest && !originalRequest.__isRetry) {
    const refreshToken = GET_REFRESH_TOKEN()

    if (!refreshToken) {
      clearLoginState()
      redirectToLogin()
      return Promise.reject(error)
    }

    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
      })
    }

    try {
      const newToken = await refreshPromise
      originalRequest.__isRetry = true
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return service(originalRequest)
    } catch (refreshError) {
      clearLoginState()
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  }

  if (status === 403) {
    ElMessage.error('错了')
  } else {
    ElMessage.error('服务器请求错误，请稍后再试')
  }
  return Promise.reject(error)
}

service.interceptors.response.use(
  (response: any) => {
    return normalizeResponseData(response?.data)
  },
  handleResponseError
)

export default service
