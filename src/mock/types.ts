export interface MockApiResponse<T> {
  code: number
  msg: string
  data: T
}

export const mockDelay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
