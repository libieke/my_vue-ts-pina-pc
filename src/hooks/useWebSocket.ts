export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';
export interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
}
export function useWebSocket(options: UseWebSocketOptions) {
  const socket = ref<WebSocket | null>(null);
  const status = ref<WebSocketStatus>('closed');
  const messages = ref<any[]>([]);
  const reconnectTimer = ref<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const reconnectCount = ref(0);
  let manualClose = false;
  const clearReconnectTimer = () => {
    if (reconnectTimer.value !== null) {
      globalThis.clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  };
  const connect = () => {
    if (!options.url) return;
    if (typeof WebSocket === 'undefined') {
      status.value = 'error';
      return;
    }
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      return;
    }
    manualClose = false;
    status.value = 'connecting';
    try {
      const ws = new WebSocket(options.url, Array.isArray(options.protocols) ? options.protocols : options.protocols ? [options.protocols] : undefined);
      socket.value = ws;
      ws.onopen = event => {
        status.value = 'open';
        reconnectCount.value = 0;
        options.onOpen?.(event);
      };
      ws.onmessage = event => {
        let payload = event.data;
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = event.data;
        }
        messages.value = [...messages.value, payload];
        options.onMessage?.(event);
      };
      ws.onerror = event => {
        status.value = 'error';
        options.onError?.(event);
      };
      ws.onclose = event => {
        status.value = 'closed';
        options.onClose?.(event);
        if (options.reconnect && !manualClose) {
          reconnectTimer.value = globalThis.setTimeout(() => {
            reconnectCount.value += 1;
            connect();
          }, options.reconnectInterval ?? 3000);
        }
      };
    } catch (error) {
      status.value = 'error';
      console.error('WebSocket 连接失败：', error);
    }
  };
  const disconnect = () => {
    manualClose = true;
    clearReconnectTimer();
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    status.value = 'closed';
  };
  const send = (data: string | Blob | ArrayBuffer) => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.value.send(data);
    return true;
  };
  if (options.autoConnect !== false) {
    connect();
  }
  onBeforeUnmount(() => {
    disconnect();
  });
  return {
    socket,
    status,
    messages,
    reconnectCount,
    connect,
    disconnect,
    send
  };
}