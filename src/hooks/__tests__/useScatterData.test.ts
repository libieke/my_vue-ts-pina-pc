import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import { useScatterData } from '@/hooks/useScatterData'
import type { UseScatterDataOptions } from '@/hooks/useScatterData'
import type { ScatterPoint } from '@/mock/scatterData'
import type { MockApiResponse } from '@/mock/types'

const makePoints = (count: number): ScatterPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    x: index,
    y: index * 2,
    value: 0.5,
    channel: '线上商城',
  }))

const ok = (points: ScatterPoint[]): MockApiResponse<ScatterPoint[]> => ({
  code: 200,
  msg: 'ok',
  data: points,
})

function mountHook(options: UseScatterDataOptions) {
  let api!: ReturnType<typeof useScatterData>

  const wrapper = mount(
    defineComponent({
      setup() {
        api = useScatterData(options)
        return () => h('div')
      },
    }),
  )

  return { wrapper, api }
}

describe('useScatterData', () => {
  it('挂载后自动请求，并维护 loading / data / pointCount', async () => {
    const fetcher = jest.fn(async () => ok(makePoints(3)))
    const { api } = mountHook({ fetcher })

    expect(api.loading.value).toBe(true)

    await flushPromises()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(api.loading.value).toBe(false)
    expect(api.error.value).toBe('')
    expect(api.data.value).toHaveLength(3)
    expect(api.pointCount.value).toBe(3)
    expect(api.isEmpty.value).toBe(false)
  })

  it('immediate: false 时不会自动请求', async () => {
    const fetcher = jest.fn(async () => ok(makePoints(2)))
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
    expect(api.data.value).toHaveLength(0)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('业务 code 非 200 时按失败处理，并使用接口返回的 msg', async () => {
    const fetcher = jest.fn(async () => ({ code: 500, msg: '服务繁忙', data: [] }))
    const { api } = mountHook({ fetcher })

    await flushPromises()

    expect(api.error.value).toBe('服务繁忙')
    expect(api.data.value).toHaveLength(0)
  })

  it('reload 会重新请求，并可传入覆盖参数', async () => {
    const fetcher = jest.fn(async () => ok(makePoints(2)))
    const { api } = mountHook({ fetcher, count: 10 })

    await flushPromises()
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ count: 10 }))

    await api.load({ count: 99 })

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenLastCalledWith(expect.objectContaining({ count: 99 }))
    expect(api.params.value.count).toBe(99)
  })

  it('竞态：只采用最后一次请求的结果', async () => {
    let resolveFirst: (value: MockApiResponse<ScatterPoint[]>) => void = () => {}
    const first = new Promise<MockApiResponse<ScatterPoint[]>>((resolve) => {
      resolveFirst = resolve
    })

    const fetcher = jest
      .fn()
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(async () => ok(makePoints(5)))

    const { api } = mountHook({ fetcher, immediate: false })

    const firstCall = api.load()
    const secondCall = api.load()

    await secondCall
    expect(api.data.value).toHaveLength(5)

    resolveFirst(ok(makePoints(1)))
    await firstCall
    await flushPromises()

    expect(api.data.value).toHaveLength(5)
  })

  it('卸载后不再更新状态', async () => {
    let resolveRequest: (value: MockApiResponse<ScatterPoint[]>) => void = () => {}
    const pending = new Promise<MockApiResponse<ScatterPoint[]>>((resolve) => {
      resolveRequest = resolve
    })

    const { wrapper, api } = mountHook({ fetcher: () => pending })

    wrapper.unmount()
    resolveRequest(ok(makePoints(4)))
    await flushPromises()

    expect(api.data.value).toHaveLength(0)
  })
})
