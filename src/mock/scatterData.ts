import type { MockApiResponse } from './types'
import { mockDelay } from './types'

export interface ScatterPoint {
  x: number
  y: number
  value: number
  channel: string
}

export interface ScatterQueryParams {
  count?: number
  channels?: number
  seed?: number
  delay?: number
}

export const DEFAULT_SCATTER_COUNT = 5000
export const DEFAULT_SCATTER_CHANNELS = 5

export interface SalesChannelProfile {
  name: string
  volume: [number, number]
  price: [number, number]
  margin: [number, number]
}

export const SCATTER_CHANNELS: SalesChannelProfile[] = [
  { name: '分销代理', volume: [1300, 1700], price: [30, 210], margin: [0.08, 0.16] },
  { name: '线上商城', volume: [1000, 1400], price: [200, 400], margin: [0.18, 0.27] },
  { name: '社交电商', volume: [700, 1100], price: [60, 260], margin: [0.26, 0.35] },
  { name: '直营门店', volume: [500, 900], price: [300, 500], margin: [0.4, 0.52] },
  { name: '跨境电商', volume: [250, 650], price: [420, 600], margin: [0.33, 0.45] },
]

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

const sampleRange = ([min, max]: [number, number], random: () => number) => {
  const ratio = (random() + random()) / 2
  return min + (max - min) * ratio
}

export function createScatterPoints(params: ScatterQueryParams = {}): ScatterPoint[] {
  const count = toPositiveInt(params.count, DEFAULT_SCATTER_COUNT)
  const requestedChannels = toPositiveInt(params.channels, DEFAULT_SCATTER_CHANNELS)
  const profiles = SCATTER_CHANNELS.slice(0, Math.min(requestedChannels, SCATTER_CHANNELS.length))
  const random = createRandom(params.seed ?? Date.now())

  const points: ScatterPoint[] = []
  const baseCount = Math.floor(count / profiles.length)
  const remainder = count - baseCount * profiles.length

  profiles.forEach((profile, index) => {
    const channelPoints = baseCount + (index < remainder ? 1 : 0)

    for (let i = 0; i < channelPoints; i += 1) {
      const volume = sampleRange(profile.volume, random)
      const price = sampleRange(profile.price, random)
      const margin = sampleRange(profile.margin, random)

      points.push({
        x: Math.round(volume),
        y: Math.round(price),
        value: clamp01(Number(margin.toFixed(3))),
        channel: profile.name,
      })
    }
  })

  return points
}

export const mockScatterDataApi = async (
  params: ScatterQueryParams = {},
): Promise<MockApiResponse<ScatterPoint[]>> => {
  await mockDelay(params.delay ?? 400)

  return {
    code: 200,
    msg: '获取渠道销售散点数据成功',
    data: createScatterPoints(params),
  }
}
