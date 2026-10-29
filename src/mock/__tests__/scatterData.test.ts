import {
  createScatterPoints,
  DEFAULT_SCATTER_COUNT,
  mockScatterDataApi,
  SCATTER_DEVICE_NAMES,
} from '@/mock/scatterData'

describe('createScatterPoints', () => {
  it('按 count 精确生成数据点', () => {
    expect(createScatterPoints({ count: 123, devices: 5, seed: 1 })).toHaveLength(123)
    expect(createScatterPoints({ count: 1, devices: 5, seed: 1 })).toHaveLength(1)
  })

  it('不传参数时使用默认数量', () => {
    expect(createScatterPoints({ seed: 1 })).toHaveLength(DEFAULT_SCATTER_COUNT)
  })

  it('相同 seed 生成完全相同的数据，便于复现', () => {
    const a = createScatterPoints({ count: 50, seed: 2024 })
    const b = createScatterPoints({ count: 50, seed: 2024 })
    expect(a).toEqual(b)
  })

  it('不同 seed 生成不同数据', () => {
    const a = createScatterPoints({ count: 50, seed: 1 })
    const b = createScatterPoints({ count: 50, seed: 2 })
    expect(a).not.toEqual(b)
  })

  it('value 落在 0~1，device 使用预置设备名', () => {
    const points = createScatterPoints({ count: 200, devices: 5, seed: 7 })

    points.forEach((point) => {
      expect(point.value).toBeGreaterThanOrEqual(0)
      expect(point.value).toBeLessThanOrEqual(1)
      expect(SCATTER_DEVICE_NAMES).toContain(point.device)
      expect(point.x).toBeGreaterThanOrEqual(-900)
      expect(point.x).toBeLessThanOrEqual(900)
    })

    expect(new Set(points.map((point) => point.device)).size).toBe(5)
  })
})

describe('mockScatterDataApi', () => {
  it('返回统一的 { code, msg, data } 结构', async () => {
    const response = await mockScatterDataApi({ count: 10, delay: 0, seed: 3 })

    expect(response.code).toBe(200)
    expect(response.msg).toContain('散点')
    expect(response.data).toHaveLength(10)
  })
})
