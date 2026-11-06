import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type {
  BranchPoint,
  FundGraphData,
  FundQueryParams,
  TrendPoint,
} from '@/mock/fundFlowData'
import { mockBranchPointsApi, mockFundGraphApi, mockFundTrendApi } from '@/mock/fundFlowData'
import type { MockApiResponse } from '@/mock/types'

export type FundFetcher<T> = (params: FundQueryParams) => Promise<MockApiResponse<T>>

export interface FundHookOptions<T> extends FundQueryParams {
  fetcher?: FundFetcher<T>
  immediate?: boolean
  onSuccess?: (data: T, params: FundQueryParams) => void
  onError?: (error: Error) => void
}

export interface FundHookResult<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string>
  isEmpty: ComputedRef<boolean>
  params: Ref<FundQueryParams>
  load: (overrides?: FundQueryParams) => Promise<T | null>
  reload: () => Promise<T | null>
  reset: () => void
}

function useFundData<T>(
  defaultFetcher: FundFetcher<T>,
  options: FundHookOptions<T> = {},
): FundHookResult<T> {
  const {
    fetcher = defaultFetcher,
    immediate = true,
    onSuccess,
    onError,
    ...initialParams
  } = options

  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref('')
  const params = ref<FundQueryParams>({ ...initialParams })

  const isEmpty = computed(() => !loading.value && data.value === null)

  let requestSeq = 0
  let disposed = false

  async function load(overrides: FundQueryParams = {}): Promise<T | null> {
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
        throw new Error(response?.msg || '图表数据加载失败')
      }

      data.value = response.data
      onSuccess?.(response.data, merged)
      return response.data
    } catch (err) {
      if (seq !== requestSeq) return data.value

      const normalized = err instanceof Error ? err : new Error(String(err))
      error.value = normalized.message || '图表数据加载失败'
      onError?.(normalized)
      return data.value
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  const reload = () => load()

  function reset() {
    requestSeq += 1
    data.value = null
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

  return { data, loading, error, isEmpty, params, load, reload, reset }
}

export function useFundGraph(options: FundHookOptions<FundGraphData> = {}) {
  return useFundData<FundGraphData>(mockFundGraphApi, options)
}

export function useFundTrend(options: FundHookOptions<TrendPoint[]> = {}) {
  return useFundData<TrendPoint[]>(mockFundTrendApi, options)
}

export function useBranchPoints(options: FundHookOptions<BranchPoint[]> = {}) {
  return useFundData<BranchPoint[]>(mockBranchPointsApi, options)
}
