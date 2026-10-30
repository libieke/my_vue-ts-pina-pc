import { buildAxisTicks, formatTickValue, niceStep } from '../axis'

describe('niceStep', () => {
  it('按 1 / 2 / 5 × 10^n 取整', () => {
    expect(niceStep(600)).toBe(100)
    expect(niceStep(1000)).toBe(200)
    expect(niceStep(300)).toBe(50)
    expect(niceStep(30)).toBe(5)
    expect(niceStep(7)).toBe(1)
  })
})

describe('formatTickValue', () => {
  it('整数刻度带千分位', () => {
    expect(formatTickValue(1000, 200)).toBe('1,000')
    expect(formatTickValue(1600, 200)).toBe('1,600')
  })

  it('小于 1 的间隔按需保留小数', () => {
    expect(formatTickValue(0.5, 0.1)).toBe('0.5')
    expect(formatTickValue(0.3, 0.1)).toBe('0.3')
  })
})

describe('buildAxisTicks', () => {
  const view = {
    width: 1200,
    height: 520,
    centerX: 975,
    centerY: 315,
    zoom: 0.728,
  }

  it('X 轴按可见范围生成刻度并换算像素位置', () => {
    const ticks = buildAxisTicks({ axis: 'x', ...view })

    expect(ticks.length).toBe(8)
    expect(ticks[0].value).toBe(200)
    expect(ticks[ticks.length - 1].value).toBe(1600)
    expect(ticks[0].pos).toBeCloseTo(35.8, 1)
  })

  it('Y 轴刻度方向相反：值越大位置越靠上', () => {
    const ticks = buildAxisTicks({ axis: 'y', ...view })

    expect(ticks.length).toBe(7)
    expect(ticks[0].value).toBe(0)
    expect(ticks[ticks.length - 1].value).toBe(600)
    expect(ticks[0].pos).toBeCloseTo(489.3, 1)
    expect(ticks[ticks.length - 1].pos).toBeCloseTo(52.5, 1)

    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i].pos).toBeLessThan(ticks[i - 1].pos)
    }
  })

  it('刻度值单调递增且数量受控', () => {
    const ticks = buildAxisTicks({ axis: 'x', ...view, target: 12 })
    expect(ticks.length).toBeLessThanOrEqual(30)

    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i].value).toBeGreaterThan(ticks[i - 1].value)
    }
  })

  it('画布尺寸或缩放无效时返回空数组', () => {
    expect(buildAxisTicks({ axis: 'x', ...view, width: 0 })).toEqual([])
    expect(buildAxisTicks({ axis: 'x', ...view, zoom: 0 })).toEqual([])
  })
})
