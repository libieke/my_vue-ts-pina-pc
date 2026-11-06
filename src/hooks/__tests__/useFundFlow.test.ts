import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import { useFundGraph, useFundTrend } from '@/hooks/useFundFlow'
import type { FundHookOptions } from '@/hooks/useFundFlow'
import type { FundGraphData, TrendPoint } from '@/mock/fundFlowData'
import type { MockApiResponse } from '@/mock/types'

const graph: FundGraphData = {
  nodes: [{ id: 'A', label: '主账户', amount: 100, risk: 'normal' }],
  edges: [],
}

const trend: TrendPoint[] = [
  { date: '2026-01-01', value: 100, type: '收入' },
  { date: '2026-01-01', value: 60, type: '支出' },
]

const ok = <T>(data: T): MockApiResponse<T> => ({ code: 200, msg: 'ok', data })

function mountGraphHook(options: FundHookOptions<FundGraphData>) {
  let api!: ReturnType<typeof useFundGraph>

  const wrapper = mount(
    defineComponent({
      setup() {
        api = useFundGraph(options)
        return () => h('div')
      },
    }),
  )

  return { wrapper, api }
}

describe('useFundFlow', () => {
  it('挂载后自动请求，并维护 loading / data', async () => {
    const fetcher = jest.fn(async () => ok(graph))
    const { api } = mountGraphHook({ fetcher })

    expect(api.loading.value).toBe(true)

    await flushPromises()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(api.loading.value).toBe(false)
    expect(api.error.value).toBe('')
    expect(api.data.value?.nodes).toHaveLength(1)
    expect(api.isEmpty.value).toBe(false)
  })

  it('请求失败时记录错误信息，不抛未捕获异常', async () => {
    const fetcher = jest.fn(async () => {
      throw new Error('网络异常')
    })
    const { api } = mountGraphHook({ fetcher })

    await flushPromises()

    expect(api.loading.value).toBe(false)
    expect(api.error.value).toBe('网络异常')
    expect(api.data.value).toBeNull()
    expect(api.isEmpty.value).toBe(true)
  })

  it('业务 code 非 200 时按失败处理', async () => {
    const fetcher = jest.fn(async () => ({ code: 500, msg: '服务繁忙', data: graph }))
    const { api } = mountGraphHook({ fetcher })

    await flushPromises()

    expect(api.error.value).toBe('服务繁忙')
    expect(api.data.value).toBeNull()
  })

  it('reload 会重新请求，并可传入覆盖参数', async () => {
    const fetcher = jest.fn(async () => ok(graph))
    const { api } = mountGraphHook({ fetcher, seed: 1 })

    await flushPromises()
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ seed: 1 }))

    await api.load({ seed: 99 })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(api.params.value.seed).toBe(99)
  })

  it('immediate: false 时不会自动请求', async () => {
    const fetcher = jest.fn(async () => ok(graph))
    const { api } = mountGraphHook({ fetcher, immediate: false })

    await flushPromises()

    expect(fetcher).not.toHaveBeenCalled()
    expect(api.isEmpty.value).toBe(true)
  })

  it('趋势 hook 返回数组数据', async () => {
    let api!: ReturnType<typeof useFundTrend>

    mount(
      defineComponent({
        setup() {
          api = useFundTrend({ fetcher: async () => ok(trend) })
          return () => h('div')
        },
      }),
    )

    await flushPromises()

    expect(api.data.value).toHaveLength(2)
    expect(api.data.value?.[0].type).toBe('收入')
  })
})
