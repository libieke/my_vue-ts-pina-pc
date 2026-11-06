import type { MockApiResponse } from './types'
import { mockDelay } from './types'
import { createRandom } from './random'


export interface FundQueryParams {
  seed?: number
  delay?: number
  days?: number
}

export interface FundNode {
  id: string
  label: string
  amount: number
  risk: 'normal' | 'high'
}

export interface FundEdge {
  id: string
  source: string
  target: string
  weight: number
  time: string
}

export interface FundGraphData {
  nodes: FundNode[]
  edges: FundEdge[]
}

export interface TrendPoint {
  date: string
  value: number
  type: '收入' | '支出'
}

export interface BranchPoint {
  lng: number
  lat: number
  name: string
  type: '总行' | '分行' | '支行'
  amount: number
}

const NODE_TEMPLATES: Array<Omit<FundNode, 'amount'> & { base: number }> = [
  { id: 'A', label: '主账户 A\n(企业)', base: 5_000_000, risk: 'normal' },
  { id: 'B', label: '账户 B\n(个人)', base: 200_000, risk: 'normal' },
  { id: 'C', label: '空壳公司 C', base: 10_000, risk: 'high' },
  { id: 'D', label: '账户 D\n(个人)', base: 500_000, risk: 'normal' },
  { id: 'E', label: '境外账户 E', base: 2_000_000, risk: 'high' },
]

const EDGE_TEMPLATES: Array<Pick<FundEdge, 'id' | 'source' | 'target'>> = [
  { id: 'e1', source: 'A', target: 'B' },
  { id: 'e2', source: 'A', target: 'C' },
  { id: 'e3', source: 'C', target: 'E' },
  { id: 'e4', source: 'B', target: 'D' },
]

const BRANCH_TEMPLATES: Array<Omit<BranchPoint, 'amount'> & { base: number }> = [
  { name: '北京总行', lng: 116.4074, lat: 39.9042, type: '总行', base: 85000 },
  { name: '上海分行', lng: 121.4737, lat: 31.2304, type: '分行', base: 62000 },
  { name: '广州分行', lng: 113.2644, lat: 23.1291, type: '分行', base: 41000 },
  { name: '深圳分行', lng: 114.0579, lat: 22.5431, type: '分行', base: 58000 },
  { name: '杭州支行', lng: 120.1551, lat: 30.2741, type: '支行', base: 28000 },
  { name: '成都支行', lng: 104.0665, lat: 30.5723, type: '支行', base: 19000 },
  { name: '西安支行', lng: 108.948, lat: 34.2632, type: '支行', base: 15000 },
  { name: '武汉支行', lng: 114.3055, lat: 30.5928, type: '支行', base: 22000 },
]

const pad = (value: number) => String(value).padStart(2, '0')

const formatDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const jitter = (base: number, ratio: number, random: () => number) =>
  Math.round(base * (1 + (random() - 0.5) * 2 * ratio))

export function createFundGraph(params: FundQueryParams = {}): FundGraphData {
  const random = createRandom(params.seed ?? Date.now())
  const now = Date.now()

  const nodes: FundNode[] = NODE_TEMPLATES.map(({ base, ...node }) => ({
    ...node,
    amount: jitter(base, 0.2, random),
  }))

  const edges: FundEdge[] = EDGE_TEMPLATES.map((edge, index) => ({
    ...edge,
    weight: jitter(600_000 + index * 350_000, 0.25, random),
    time: formatDateTime(new Date(now - (index + 1) * 36 * 60 * 60 * 1000)),
  }))

  return { nodes, edges }
}

export function createFundTrend(params: FundQueryParams = {}): TrendPoint[] {
  const days = Math.max(1, Math.min(31, Math.floor(params.days ?? 7)))
  const random = createRandom(params.seed ?? Date.now())
  const points: TrendPoint[] = []
  const today = new Date()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const label = formatDate(date)

    points.push(
      { date: label, value: Number((jitter(1500, 0.4, random) / 1).toFixed(1)), type: '收入' },
      { date: label, value: Number((jitter(1100, 0.4, random) / 1).toFixed(1)), type: '支出' },
    )
  }

  return points
}

export function createBranchPoints(params: FundQueryParams = {}): BranchPoint[] {
  const random = createRandom(params.seed ?? Date.now())

  return BRANCH_TEMPLATES.map(({ base, ...branch }) => ({
    ...branch,
    amount: jitter(base, 0.3, random),
  }))
}

export const mockFundGraphApi = async (
  params: FundQueryParams = {},
): Promise<MockApiResponse<FundGraphData>> => {
  await mockDelay(params.delay ?? 300)
  return { code: 200, msg: '获取资金流向图谱成功', data: createFundGraph(params) }
}

export const mockFundTrendApi = async (
  params: FundQueryParams = {},
): Promise<MockApiResponse<TrendPoint[]>> => {
  await mockDelay(params.delay ?? 300)
  return { code: 200, msg: '获取资金流水趋势成功', data: createFundTrend(params) }
}

export const mockBranchPointsApi = async (
  params: FundQueryParams = {},
): Promise<MockApiResponse<BranchPoint[]>> => {
  await mockDelay(params.delay ?? 300)
  return { code: 200, msg: '获取网点热度成功', data: createBranchPoints(params) }
}
