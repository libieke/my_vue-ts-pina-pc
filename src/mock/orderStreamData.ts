import type { MockApiResponse } from './types'
import { mockDelay } from './types'
import { createRandom, pick, randomInt } from './random'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded'

export interface OrderRecord {
  id: string
  orderNo: string
  channel: string
  product: string
  amount: number
  status: OrderStatus
  createdAt: string
}

export interface OrderQueryParams {
  count?: number
  seed?: number
  delay?: number
}

export const DEFAULT_ORDER_COUNT = 5000

export const ORDER_CHANNELS = ['线上商城', '直营门店', '分销代理', '社交电商', '跨境电商']

export const ORDER_PRODUCTS = [
  '无线蓝牙耳机',
  '智能手表',
  '便携充电宝',
  '机械键盘',
  '空气净化器',
  '扫地机器人',
  '显示器支架',
  '运动手环',
]

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }
> = {
  pending: { label: '待付款', type: 'warning' },
  paid: { label: '已支付', type: 'primary' },
  shipped: { label: '已发货', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  refunded: { label: '已退款', type: 'danger' },
}

const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
  ['paid', 32],
  ['shipped', 28],
  ['completed', 26],
  ['pending', 9],
  ['refunded', 5],
]

const STATUS_TOTAL_WEIGHT = STATUS_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0)

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

function pickStatus(random: () => number): OrderStatus {
  let target = random() * STATUS_TOTAL_WEIGHT
  for (const [status, weight] of STATUS_WEIGHTS) {
    target -= weight
    if (target <= 0) return status
  }
  return 'paid'
}

function buildOrderNo(date: Date, index: number) {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `SO${year}${month}${day}${pad(index + 1, 4)}`
}

function formatTime(date: Date) {
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toPositiveInt = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value as number))
}

export function createOrderRecords(params: OrderQueryParams = {}): OrderRecord[] {
  const count = toPositiveInt(params.count, DEFAULT_ORDER_COUNT)
  const random = createRandom(params.seed ?? Date.now())
  const records: OrderRecord[] = []

  let cursor = Date.now()

  for (let i = 0; i < count; i += 1) {
    cursor -= randomInt(random, 20 * 1000, 3 * 60 * 1000)
    const date = new Date(cursor)

    records.push({
      id: `order-${i + 1}`,
      orderNo: buildOrderNo(date, i),
      channel: pick(random, ORDER_CHANNELS),
      product: pick(random, ORDER_PRODUCTS),
      amount: randomInt(random, 59, 2999),
      status: pickStatus(random),
      createdAt: formatTime(date),
    })
  }

  return records
}

export const mockOrderStreamApi = async (
  params: OrderQueryParams = {},
): Promise<MockApiResponse<OrderRecord[]>> => {
  await mockDelay(params.delay ?? 300)

  return {
    code: 200,
    msg: '获取订单流水成功',
    data: createOrderRecords(params),
  }
}