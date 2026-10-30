
export interface AxisTick {
  value: number
  pos: number
  label: string
}

export interface AxisTickOptions {
  axis: 'x' | 'y'
  width: number
  height: number
  centerX: number
  centerY: number
  zoom: number
  target?: number
}

const DEFAULT_TARGET = 6
const MAX_TICKS = 30

export function niceStep(span: number, target = DEFAULT_TARGET) {
  const rough = span / target
  const power = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / power
  const factor = normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10
  return factor * power
}

export function formatTickValue(value: number, step: number) {
  const decimals = step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : 0
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function buildAxisTicks(options: AxisTickOptions): AxisTick[] {
  const { axis, width, height, centerX, centerY, zoom } = options
  const target = options.target ?? DEFAULT_TARGET

  if (!(width > 0) || !(height > 0) || !(zoom > 0)) return []

  const isX = axis === 'x'
  const size = isX ? width : height
  const center = isX ? centerX : centerY
  const halfSpan = size / 2 / zoom
  const min = center - halfSpan
  const max = center + halfSpan
  const span = max - min

  if (!Number.isFinite(span) || span <= 0) return []

  const step = niceStep(span, target)
  const first = Math.ceil(min / step) * step
  const ticks: AxisTick[] = []

  for (let i = 0; i < MAX_TICKS; i += 1) {
    const value = first + i * step
    if (value > max) break

    const pos = isX
      ? (value - centerX) * zoom + width / 2
      : height / 2 - (value - centerY) * zoom

    ticks.push({ value, pos, label: formatTickValue(value, step) })
  }

  return ticks
}
