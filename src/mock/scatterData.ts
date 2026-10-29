import type { MockApiResponse } from './types'
import { mockDelay } from './types'

export interface ScatterPoint {
  x: number
  y: number
  value: number
  device: string
}

export interface ScatterQueryParams {
  count?: number
  devices?: number
  seed?: number
  delay?: number
}

export const DEFAULT_SCATTER_COUNT = 5000
export const DEFAULT_SCATTER_DEVICES = 5

export const SCATTER_DEVICE_NAMES = ['一号产线', '二号产线', '三号产线', '四号产线', '五号产线']

function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const toPositiveInt = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value as number))
}

export function createScatterPoints(params: ScatterQueryParams = {}): ScatterPoint[] {
  const count = toPositiveInt(params.count, DEFAULT_SCATTER_COUNT)
  const devices = toPositiveInt(params.devices, DEFAULT_SCATTER_DEVICES)
  const random = createRandom(params.seed ?? Date.now())

  const points: ScatterPoint[] = []
  const baseCount = Math.floor(count / devices)
  const remainder = count - baseCount * devices

  for (let d = 0; d < devices; d += 1) {
    const deviceCount = baseCount + (d < remainder ? 1 : 0)
    const device = SCATTER_DEVICE_NAMES[d % SCATTER_DEVICE_NAMES.length]

    const baseY = (d - devices / 2) * 200
    const baseValue = 0.5 + d * 0.08

    for (let i = 0; i < deviceCount; i += 1) {
      const x = deviceCount === 1 ? 0 : (i / (deviceCount - 1)) * 1800 - 900

      const cycle = Math.sin(x * 0.005 + d) * 80
      const noise = (random() - 0.5) * 40
      const isSpike = random() < 0.02
      const spike = isSpike ? (random() > 0.5 ? 200 : -200) : 0
      const y = baseY + cycle + noise + spike

      let value = baseValue + (random() - 0.5) * 0.2
      if (isSpike) value = random() * 0.3

      points.push({ x, y, value: clamp01(value), device })
    }
  }

  return points
}

export const mockScatterDataApi = async (
  params: ScatterQueryParams = {},
): Promise<MockApiResponse<ScatterPoint[]>> => {
  await mockDelay(params.delay ?? 400)

  return {
    code: 200,
    msg: '获取散点图数据成功',
    data: createScatterPoints(params),
  }
}
