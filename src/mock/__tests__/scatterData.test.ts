import {
  createScatterPoints,
  DEFAULT_SCATTER_COUNT,
  mockScatterDataApi,
  SCATTER_CHANNELS,
} from '@/mock/scatterData'

const CHANNEL_NAMES = SCATTER_CHANNELS.map((channel) => channel.name)

describe('createScatterPoints（渠道销售数据）', () => {
  it('按 count 精确生成数据点', () => {
    expect(createScatterPoints({ count: 123, channels: 5, seed: 1 })).toHaveLength(123)
    expect(createScatterPoints({ count: 1, channels: 5, seed: 1 })).toHaveLength(1)
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

  it('销量与客单价为正数，毛利率落在 0~1，渠道来自预置列表', () => {
    const points = createScatterPoints({ count: 200, channels: 5, seed: 7 })

    points.forEach((point) => {
      expect(point.x).toBeGreaterThan(0)
      expect(point.y).toBeGreaterThan(0)
      expect(point.value).toBeGreaterThanOrEqual(0)
      expect(point.value).toBeLessThanOrEqual(1)
      expect(CHANNEL_NAMES).toContain(point.channel)
    })

    expect(new Set(points.map((point) => point.channel)).size).toBe(5)
  })

  it('每个渠道的点聚集在各自的销量 / 客单价区间内', () => {
    const points = createScatterPoints({ count: 500, channels: 5, seed: 11 })

    SCATTER_CHANNELS.forEach((channel) => {
      const channelPoints = points.filter((point) => point.channel === channel.name)
      expect(channelPoints.length).toBeGreaterThan(0)

      channelPoints.forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(Math.floor(channel.volume[0]) - 1)
        expect(point.x).toBeLessThanOrEqual(Math.ceil(channel.volume[1]) + 1)
        expect(point.y).toBeGreaterThanOrEqual(Math.floor(channel.price[0]) - 1)
        expect(point.y).toBeLessThanOrEqual(Math.ceil(channel.price[1]) + 1)
      })
    })
  })

  it('channels 参数可以限制渠道数量', () => {
    const points = createScatterPoints({ count: 100, channels: 2, seed: 3 })
    expect(new Set(points.map((point) => point.channel)).size).toBe(2)
  })
})

describe('mockScatterDataApi', () => {
  it('返回统一的 { code, msg, data } 结构', async () => {
    const response = await mockScatterDataApi({ count: 10, delay: 0, seed: 3 })

    expect(response.code).toBe(200)
    expect(response.msg).toContain('渠道')
    expect(response.data).toHaveLength(10)
  })
})
