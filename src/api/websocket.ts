// WebSocket 业务协议：统一看板消息事件名和数据格式
// 后续接真实后端时，只需要替换这里的 URL 和消息内容，不需要改页面逻辑。

export interface DashboardStats {
  totalUsers: number
  todayVisitors: number
  orderTotal: number
  totalSales: number
}

export interface DashboardSocketPayload {
  event?: string
  channel?: string
  data?: Partial<DashboardStats>
  totalUsers?: number
  todayVisitors?: number
  orderTotal?: number
  totalSales?: number
}

// 实际后端地址建议配置为：ws://localhost:8080/ws/dashboard
// 这里先保留可运行的示例地址，等后端接通后替换即可。
export const DASHBOARD_WS_URL = 'wss://echo.websocket.events'

export const buildDashboardSubscribeMessage = () => {
  return JSON.stringify({
    event: 'subscribe',
    channel: 'dashboard',
    payload: {
      module: 'home-dashboard',
      timestamp: Date.now(),
    },
  })
}

export const parseDashboardMessage = (
  raw: string
): Partial<DashboardStats> | null => {
  try {
    const payload = JSON.parse(raw) as DashboardSocketPayload
    const data = payload?.data ?? payload

    if (!data || typeof data !== 'object') return null

    const nextStats: Partial<DashboardStats> = {}

    if (typeof data.totalUsers === 'number') nextStats.totalUsers = data.totalUsers
    if (typeof data.todayVisitors === 'number') nextStats.todayVisitors = data.todayVisitors
    if (typeof data.orderTotal === 'number') nextStats.orderTotal = data.orderTotal
    if (typeof data.totalSales === 'number') nextStats.totalSales = data.totalSales

    return Object.keys(nextStats).length ? nextStats : null
  } catch {
    return null
  }
}
