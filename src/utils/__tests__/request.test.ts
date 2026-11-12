jest.mock('axios', () => {
  const mockAxiosInstance = Object.assign(
    jest.fn((config) => Promise.resolve({ data: { ok: true, config } })),
    {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      defaults: {},
      post: jest.fn(),
    }
  )

  const mockAxios = Object.assign(jest.fn(), {
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  })

  return {
    __esModule: true,
    default: mockAxios,
  }
})

import axios from 'axios'
import { handleResponseError } from '../request'

describe('request 无感刷新', () => {
  beforeEach(() => {
    ;(globalThis as any).__APP_ENV__ = {
      VITE_API_URL: 'https://mock-api.example',
      VITE_REFRESH_URL: '/auth/refresh',
    }
    localStorage.clear()
    ;(axios as any).post.mockReset()
    ;(axios.create as jest.Mock).mockClear()
  })

  it('在 401 时自动刷新 token 并重试原请求', async () => {
    localStorage.setItem('TOKEN', 'old-access-token')
    localStorage.setItem('REFRESH_TOKEN', 'old-refresh-token')

    ;(axios as any).post.mockResolvedValue({
      data: {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    })

    const error = {
      response: { status: 401 },
      config: {
        url: '/api/test',
        method: 'get',
        headers: {
          Authorization: 'Bearer old-access-token',
        },
      },
    }

    const result = await handleResponseError(error)

    expect((axios as any).post).toHaveBeenCalledWith(
      '/auth/refresh',
      { refreshToken: 'old-refresh-token' },
      expect.objectContaining({
        timeout: 5000,
      })
    )
    expect(localStorage.getItem('TOKEN')).toBe('new-access-token')
    expect(localStorage.getItem('REFRESH_TOKEN')).toBe('new-refresh-token')
    expect(result).toEqual({
      data: {
        ok: true,
        config: error.config,
      },
    })
  })
})
