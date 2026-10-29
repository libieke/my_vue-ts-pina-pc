import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { ScatterPoint, ScatterQueryParams } from '@/mock/scatterData'
import { mockScatterDataApi } from '@/mock/scatterData'
import type { MockApiResponse } from '@/mock/types'

export type ScatterDataFetcher = (
  params: ScatterQueryParams,
) => Promise<MockApiResponse<ScatterPoint[]>>

export interface UseScatterDataOptions extends ScatterQueryParams {
  fetcher?: ScatterDataFetcher
  immediate?: boolean
  onSuccess?: (points: ScatterPoint[], params: ScatterQueryParams) => void
  onError?: (error: Error) => void
}

export interface UseScatterDataReturn {
  data: Ref<ScatterPoint[]>
  loading: Ref<boolean>
  error: Ref<string>
  pointCount: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
  params: Ref<ScatterQueryParams>
  load: (overrides?: ScatterQueryParams) => Promise<ScatterPoint[]>
  reload: () => Promise<ScatterPoint[]>
  reset: () => void
}

export function useScatterData(options: UseScatterDataOptions = {}): UseScatterDataReturn {
  const {
    fetcher = mockScatterDataApi,
    immediate = true,
    onSuccess,
    onError,
    ...initialParams
  } = options

  const data = ref<ScatterPoint[]>([])
  const loading = ref(false)
  const error = ref('')
  const params = ref<ScatterQueryParams>({ ...initialParams })

  const pointCount = computed(() => data.value.length)
  const isEmpty = computed(() => !loading.value && data.value.length === 0)

  let requestSeq = 0
  let disposed = false

  async function load(overrides: ScatterQueryParams = {}): Promise<ScatterPoint[]> {
    if (disposed) return data.value

    const merged = { ...params.value, ...overrides }
    params.value = merged

    const seq = (requestSeq += 1)
    loading.value = true
    error.value = ''

    try {
      const response = await fetcher(merged)

      if (seq !== requestSeq) return data.value

      if (!response || (typeof response.code === 'number' && response.code !== 200)) {
        throw new Error(response?.msg || '散点数据加载失败')
      }

      const list = Array.isArray(response.data) ? response.data : []
      data.value = list
      onSuccess?.(list, merged)
      return list
    } catch (err) {
      if (seq !== requestSeq) return data.value

      const normalized = err instanceof Error ? err : new Error(String(err))
      error.value = normalized.message || '散点数据加载失败'
      onError?.(normalized)
      return data.value
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  const reload = () => load()

  function reset() {
    requestSeq += 1
    data.value = []
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

  return { data, loading, error, pointCount, isEmpty, params, load, reload, reset }
}
