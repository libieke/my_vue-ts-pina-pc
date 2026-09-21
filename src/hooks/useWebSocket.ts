
// WebSocket 连接状态
export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error'

// WebSocket Hook 配置项
export interface UseWebSocketOptions {
  // 目标地址，例如 ws://localhost:8080/notify
  url: string
  // 是否在 Hook 初始化时自动连接
  autoConnect?: boolean
  // 链接断开后是否自动重连
  reconnect?: boolean
  // 重连间隔，单位毫秒
  reconnectInterval?: number
  // WebSocket subprotocol，可传单个字符串或字符串数组
  protocols?: string | string[]
  // 连接成功回调
  onOpen?: (event: Event) => void
  // 收到消息回调
  onMessage?: (event: MessageEvent) => void
  // 连接错误回调
  onError?: (event: Event) => void
  // 连接关闭回调
  onClose?: (event: CloseEvent) => void
}

// 通用 WebSocket Hook：负责连接、断开、消息缓存和自动重连
export function useWebSocket(options: UseWebSocketOptions) {
  // 当前 WebSocket 实例
  const socket = ref<WebSocket | null>(null)
  // 连接状态
  const status = ref<WebSocketStatus>('closed')
  // 已收到消息列表，便于页面展示或调试
  const messages = ref<any[]>([])
  // 自动重连定时器
  const reconnectTimer = ref<number | null>(null)
  // 当前重连次数
  const reconnectCount = ref(0)
  // 标记是否为手动关闭，避免手动关闭后自动重连
  let manualClose = false

  // 清理重连定时器，避免重复重连和内存泄漏
  const clearReconnectTimer = () => {
    if (reconnectTimer.value !== null) {
      globalThis.clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  // 建立 websocket 连接
  const connect = () => {
    if (!options.url) return

    // 浏览器环境中不存在 WebSocket 时直接返回错误状态
    if (typeof WebSocket === 'undefined') {
      status.value = 'error'
      return
    }

    // 已连接则不重复创建
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      return
    }

    manualClose = false
    status.value = 'connecting'

    try {
      const ws = new WebSocket(
        options.url,
        Array.isArray(options.protocols)
          ? options.protocols
          : options.protocols
            ? [options.protocols]
            : undefined
      )

      socket.value = ws

      ws.onopen = (event) => {
        status.value = 'open'
        reconnectCount.value = 0
        options.onOpen?.(event)
      }

      ws.onmessage = (event) => {
        let payload = event.data

        try {
          payload = JSON.parse(event.data)
        } catch {
          payload = event.data
        }

        // 保存消息，供业务组件读取
        messages.value = [...messages.value, payload]
        options.onMessage?.(event)
      }

      ws.onerror = (event) => {
        status.value = 'error'
        options.onError?.(event)
      }

      ws.onclose = (event) => {
        status.value = 'closed'
        options.onClose?.(event)

        if (options.reconnect && !manualClose) {
          reconnectTimer.value = globalThis.setTimeout(() => {
            reconnectCount.value += 1
            connect()
          }, options.reconnectInterval ?? 3000)
        }
      }
    } catch (error) {
      status.value = 'error'
      console.error('WebSocket 连接失败：', error)
    }
  }

  // 主动断开连接
  const disconnect = () => {
    manualClose = true
    clearReconnectTimer()

    if (socket.value) {
      socket.value.close()
      socket.value = null
    }

    status.value = 'closed'
  }

  // 发送消息
  const send = (data: string | Blob | ArrayBuffer) => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.value.send(data)
    return true
  }

  // 默认自动连接
  if (options.autoConnect !== false) {
    connect()
  }

  // 组件卸载时关闭 websocket
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    socket,
    status,
    messages,
    reconnectCount,
    connect,
    disconnect,
    send,
  }
}
