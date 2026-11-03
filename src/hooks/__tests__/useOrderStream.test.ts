import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import { useOrderStream } from '@/hooks/useOrderStream'
import type { UseOrderStreamOptions } from '@/hooks/useOrderStream'
import type { OrderRecord } from '@/mock/orderStreamData'
import type { MockApiResponse } from '@/mock/types'

const makeOrders = (count: number): OrderRecord[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `order-${index + 1}`,
    orderNo: `SO20260101${String(index + 1).padStart(4, '0')}`,
    channel: '线上商城',
    product: '无线蓝牙耳机',
    amount: 199,
    status: 'paid',
    createdAt: '01-01 10:00',
  }))

const ok = (records: OrderRecord[]): MockApiResponse<OrderRecord[]> => ({
  code: 200,
  msg: 'ok',
  data: records,
})

function mountHook(options: UseOrderStreamOptions) {
  let api!: ReturnType<typeof useOrderStream>

  const wrapper = mount(
    defineComponent({
      setup() {
        api = useOrderStream(options)
        return () => h('div')
      },
    }),
  )

  return { wrapper, api }
}

describe('useOrderStream', () => {
  it('挂载后自动请求，并维护 loading / list / total', async () => {
    const fetcher = jest.fn(async () => ok(makeOrders(5)))
    const { api } = mountHook({ fetcher })

    expect(api.loading.value).toBe(true)

    await flushPromises()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(api.loading.value).toBe(false)
    expect(api.error.value).toBe('')
    expect(api.list.value).toHaveLength(5)
    expect(api.total.value).toBe(5)
    expect(api.isEmpty.value).toBe(false)
  })

  it('immediate: false 时不会自动请求', async () => {
    const fetcher = jest.fn(async () => ok(makeOrders(3)))
    const { api } = mountHook({ fetcher, immediate: false })

    await flushPromises()

    expect(fetcher).not.toHaveBeenCalled()
    expect(api.isEmpty.value).toBe(true)
  })

  it('请求失败时记录错误信息，不抛出未捕获异常', async () => {
    const fetcher = jest.fn(async () => {
      throw new Error('网络异常')
    })
    const onError = jest.fn()
    const { api } = mountHook({ fetcher, onError })

    await flushPromises()

    expect(api.loading.value).toBe(false)
    expect(api.error.value).toBe('网络异常')
    expect(api.list.value).toHaveLength(0)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('业务 code 非 200 时按失败处理，并使用接口 msg', async () => {
    const fetcher = jest.fn(async () => ({ code: 500, msg: '服务繁忙', data: [] }))
    const { api } = mountHook({ fetcher })

    await flushPromises()

    expect(api.error.value).toBe('服务繁忙')
    expect(api.list.value).toHaveLength(0)
  })

  it('reload 会重新请求，并可传入覆盖参数', async () => {
    const fetcher = jest.fn(async () => ok(makeOrders(2)))
    const { api } = mountHook({ fetcher, count: 100 })

    await flushPromises()
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ count: 100 }))

    await api.load({ count: 8 })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ count: 8 }))
    expect(api.params.value.count).toBe(8)
  })

  it('竞态：只采用最后一次请求的结果', async () => {
    let resolveFirst: (value: MockApiResponse<OrderRecord[]>) => void = () => {}
    const first = new Promise<MockApiResponse<OrderRecord[]>>((resolve) => {
      resolveFirst = resolve
    })

    const fetcher = jest
      .fn()
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(async () => ok(makeOrders(6)))

    const { api } = mountHook({ fetcher, immediate: false })

    const firstCall = api.load()
    const secondCall = api.load()

    await secondCall
    expect(api.list.value).toHaveLength(6)

    resolveFirst(ok(makeOrders(1)))
    await firstCall
    await flushPromises()

    expect(api.list.value).toHaveLength(6)
  })

  it('卸载后不再更新状态', async () => {
    let resolveRequest: (value: MockApiResponse<OrderRecord[]>) => void = () => {}
    const pending = new Promise<MockApiResponse<OrderRecord[]>>((resolve) => {
      resolveRequest = resolve
    })

    const { wrapper, api } = mountHook({ fetcher: () => pending })

    wrapper.unmount()
    resolveRequest(ok(makeOrders(4)))
    await flushPromises()

    expect(api.list.value).toHaveLength(0)
  })
})
