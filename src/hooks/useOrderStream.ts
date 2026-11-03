import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { OrderQueryParams, OrderRecord } from '@/mock/orderStreamData'
import { mockOrderStreamApi } from '@/mock/orderStreamData'
import type { MockApiResponse } from '@/mock/types'

export type OrderStreamFetcher = (
  params: OrderQueryParams,
) => Promise<MockApiResponse<OrderRecord[]>>

export interface UseOrderStreamOptions extends OrderQueryParams {
  fetcher?: OrderStreamFetcher
  immediate?: boolean
  onSuccess?: (list: OrderRecord[], params: OrderQueryParams) => void
  onError?: (error: Error) => void
}

export interface UseOrderStreamReturn {
  list: Ref<OrderRecord[]>
  loading: Ref<boolean>
  error: Ref<string>
  total: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
  params: Ref<OrderQueryParams>
  load: (overrides?: OrderQueryParams) => Promise<OrderRecord[]>
  reload: () => Promise<OrderRecord[]>
  reset: () => void
}

export function useOrderStream(options: UseOrderStreamOptions = {}): UseOrderStreamReturn {
  const {
    fetcher = mockOrderStreamApi,
    immediate = true,
    onSuccess,
    onError,
    ...initialParams
  } = options

  const list = ref<OrderRecord[]>([])
  const loading = ref(false)
  const error = ref('')
  const params = ref<OrderQueryParams>({ ...initialParams })

  const total = computed(() => list.value.length)
  const isEmpty = computed(() => !loading.value && list.value.length === 0)

  let requestSeq = 0
  let disposed = false

  async function load(overrides: OrderQueryParams = {}): Promise<OrderRecord[]> {
    if (disposed) return list.value

    const merged = { ...params.value, ...overrides }
    params.value = merged

    const seq = (requestSeq += 1)
    loading.value = true
    error.value = ''

    try {
      const response = await fetcher(merged)

      if (seq !== requestSeq) return list.value

      if (!response || (typeof response.code === 'number' && response.code !== 200)) {
        throw new Error(response?.msg || '订单数据加载失败')
      }

      const records = Array.isArray(response.data) ? response.data : []
      list.value = records
      onSuccess?.(records, merged)
      return records
    } catch (err) {
      if (seq !== requestSeq) return list.value

      const normalized = err instanceof Error ? err : new Error(String(err))
      error.value = normalized.message || '订单数据加载失败'
      onError?.(normalized)
      return list.value
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  const reload = () => load()

  function reset() {
    requestSeq += 1
    list.value = []
    error.value = ''
    loading.value = false
  }

  if (immediate) {
    onMounted(() => {
      void load()
    })
  }

  onBeforeUnmount(() => {
    disposed = true
    requestSeq += 1
  })

  return { list, loading, error, total, isEmpty, params, load, reload, reset }
}
