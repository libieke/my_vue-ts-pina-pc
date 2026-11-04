
export type RandomFn = () => number

export function createRandom(seed: number): RandomFn {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInt(random: RandomFn, min: number, max: number) {
  return Math.floor(min + random() * (max - min + 1))
}

export function pick<T>(random: RandomFn, list: readonly T[]): T {
  return list[Math.floor(random() * list.length)]
}

export function sampleRange([min, max]: readonly [number, number], random: RandomFn) {
  const ratio = (random() + random()) / 2
  return min + (max - min) * ratio
}
