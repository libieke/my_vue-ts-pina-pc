import {
  createBranchPoints,
  createFundGraph,
  createFundTrend,
  mockBranchPointsApi,
  mockFundGraphApi,
  mockFundTrendApi,
} from '@/mock/fundFlowData'

describe('createFundGraph', () => {
  it('生成固定拓扑的 5 个节点与 4 条边', () => {
    const graph = createFundGraph({ seed: 1 })

    expect(graph.nodes).toHaveLength(5)
    expect(graph.edges).toHaveLength(4)
    expect(graph.nodes.every((node) => node.amount > 0)).toBe(true)
    expect(graph.edges.every((edge) => edge.weight > 0)).toBe(true)
  })

  it('边的起点与终点都能在节点里找到', () => {
    const graph = createFundGraph({ seed: 2 })
    const ids = new Set(graph.nodes.map((node) => node.id))

    graph.edges.forEach((edge) => {
      expect(ids.has(edge.source)).toBe(true)
      expect(ids.has(edge.target)).toBe(true)
      expect(edge.time).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    })
  })

  it('相同 seed 可复现，不同 seed 结果不同', () => {
    expect(createFundGraph({ seed: 9 })).toEqual(createFundGraph({ seed: 9 }))
    expect(createFundGraph({ seed: 9 })).not.toEqual(createFundGraph({ seed: 10 }))
  })
})

describe('createFundTrend', () => {
  it('默认返回 7 天、每天收入 + 支出两条记录', () => {
    const points = createFundTrend({ seed: 1 })

    expect(points).toHaveLength(14)
    expect(points.filter((item) => item.type === '收入')).toHaveLength(7)
    expect(points.filter((item) => item.type === '支出')).toHaveLength(7)
  })

  it('日期连续且格式为 YYYY-MM-DD', () => {
    const dates = [...new Set(createFundTrend({ seed: 1 }).map((item) => item.date))]

    expect(dates).toHaveLength(7)
    dates.forEach((date) => expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/))
    expect([...dates].sort()).toEqual(dates)
  })

  it('days 参数受 1~31 限制', () => {
    expect(createFundTrend({ days: 3, seed: 1 })).toHaveLength(6)
    expect(createFundTrend({ days: 100, seed: 1 })).toHaveLength(62)
  })
})

describe('createBranchPoints', () => {
  it('返回 8 个网点，坐标为合法经纬度且交易额为正', () => {
    const points = createBranchPoints({ seed: 1 })

    expect(points).toHaveLength(8)
    points.forEach((point) => {
      expect(point.lng).toBeGreaterThan(70)
      expect(point.lng).toBeLessThan(140)
      expect(point.lat).toBeGreaterThan(10)
      expect(point.lat).toBeLessThan(60)
      expect(point.amount).toBeGreaterThan(0)
      expect(['总行', '分行', '支行']).toContain(point.type)
    })
  })
})

describe('mock 接口', () => {
  it('三个接口都返回统一的 { code, msg, data } 结构', async () => {
    const graph = await mockFundGraphApi({ delay: 0, seed: 1 })
    const trend = await mockFundTrendApi({ delay: 0, seed: 1 })
    const branches = await mockBranchPointsApi({ delay: 0, seed: 1 })

    expect(graph.code).toBe(200)
    expect(graph.data.nodes.length).toBeGreaterThan(0)

    expect(trend.code).toBe(200)
    expect(trend.data.length).toBeGreaterThan(0)

    expect(branches.code).toBe(200)
    expect(branches.data.length).toBeGreaterThan(0)
  })
})
