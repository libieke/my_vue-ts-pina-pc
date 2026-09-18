// 存储数据
export const SET_TOKEN = (token: string) => {
  localStorage.setItem('TOKEN', token)
}

// 本地存储获取数据
export const GET_TOKEN = () => {
  return localStorage.getItem('TOKEN')
}

export const SET_USER_INFO = (userInfo: { username?: string; avatar?: string }) => {
  localStorage.setItem('USER_INFO', JSON.stringify(userInfo))
}

export const GET_USER_INFO = () => {
  const info = localStorage.getItem('USER_INFO')
  if (!info) return { username: '', avatar: '' }
  try {
    return JSON.parse(info)
  } catch {
    return { username: '', avatar: '' }
  }
}

export const REMOVE_USER_INFO = () => {
  localStorage.removeItem('USER_INFO')
}

// 本地存储删除数据方法
export const REMOVE_TOKEN = () => {
  localStorage.removeItem('TOKEN')
}