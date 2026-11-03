import {
  createOrderRecords,
  DEFAULT_ORDER_COUNT,
  mockOrderStreamApi,
  ORDER_CHANNELS,
  ORDER_PRODUCTS,
  ORDER_STATUS_META,
} from '@/mock/orderStreamData'

const STATUS_KEYS = Object.keys(ORDER_STATUS_META)

describe('createOrderRecords（订单流水）', () => {
  it('按 count 精确生成', () => {
    expect(createOrderRecords({ count: 128, seed: 1 })).toHaveLength(128)
    expect(createOrderRecords({ count: 1, seed: 1 })).toHaveLength(1)
  })

  it('不传参数时使用默认数量', () => {
    expect(createOrderRecords({ seed: 1 })).toHaveLength(DEFAULT_ORDER_COUNT)
  })

  it('相同 seed 生成完全相同的数据', () => {
    const resultA = createOrderRecords({ count: 30, seed: 2026 })
    const resultB = createOrderRecords({ count: 30, seed: 2026 })
    expect(resultA).toEqual(resultB)
  })

  it('不同 seed 生成不同数据', () => {
    const a = createOrderRecords({ count: 30, seed: 1 })
    const b = createOrderRecords({ count: 30, seed: 2 })
    expect(a).not.toEqual(b)
  })

  it('字段合法:渠道、商品、金额、状态、时间格式', () => {
    const records = createOrderRecords({ count: 100, seed: 7 })

    records.forEach((record) => {
      expect(ORDER_CHANNELS).toContain(record.channel)
      expect(ORDER_PRODUCTS).toContain(record.product)
      expect(record.amount).toBeGreaterThanOrEqual(59)
      expect(record.amount).toBeLessThanOrEqual(2999)
      expect(STATUS_KEYS).toContain(record.status)
      expect(record.createdAt).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/)
      expect(record.orderNo).toMatch(/^SO\d{8}\d{4}$/)
    })
  })

  it('id 与订单号唯一', () => {
    const records = createOrderRecords({ count: 200, seed: 3 })

    expect(new Set(records.map((item) => item.id)).size).toBe(200)
    expect(new Set(records.map((item) => item.orderNo)).size).toBe(200)
  })
})

describe('mockOrderStreamApi', () => {
  it('返回统一的 { code, msg, data } 结构', async () => {
    const response = await mockOrderStreamApi({ count: 8, delay: 0, seed: 3 })

    expect(response.code).toBe(200)
    expect(response.msg).toContain('订单')
    expect(response.data).toHaveLength(8)
  })
})