import { queryOptions, useQuery } from '@tanstack/react-query'
import { isError } from './base'
import type { DataResponse, ErrorResponse } from './base'
import { env } from '@/env'

export type BreakdownItem = {
  name: string
  count: number
}

export type LinkAnalytics = {
  range: { from: string; to: string }
  summary: { total: number; unique: number }
  timeseries: Array<{ date: string; total: number; unique: number }>
  countries: Array<BreakdownItem>
  referrers: Array<BreakdownItem>
  browsers: Array<BreakdownItem>
  os: Array<BreakdownItem>
  devices: Array<BreakdownItem>
}

export type AnalyticsRange = { from?: string; to?: string }

export class AnalyticsError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const analyticsAPI = {
  getLinkAnalytics: async (slug: string, range: AnalyticsRange = {}) => {
    const params = new URLSearchParams()
    if (range.from) params.set('from', range.from)
    if (range.to) params.set('to', range.to)
    const query = params.size ? `?${params}` : ''

    const res = await fetch(
      `${env.VITE_BACKEND_URL}/api/${encodeURIComponent(slug)}/analytics${query}`,
      { credentials: 'include' },
    )
    const data: ErrorResponse | DataResponse<LinkAnalytics> = await res
      .json()
      .catch(() => ({
        message: 'Unexpected response',
        errors: ['Unexpected response'],
      }))

    return { request: res, data }
  },
}

export const analyticsOptions = (slug: string, range: AnalyticsRange = {}) =>
  queryOptions({
    queryKey: ['analytics', slug, range.from ?? null, range.to ?? null],
    queryFn: async () => {
      const { request, data } = await analyticsAPI.getLinkAnalytics(slug, range)

      if (!request.ok || isError(data) || !data.data) {
        const message =
          (data as ErrorResponse).message || 'Failed to load analytics'
        throw new AnalyticsError(message, request.status)
      }

      return data.data
    },
    // A 401/403/404 will not fix itself on retry
    retry: (count, error) =>
      !(error instanceof AnalyticsError && error.status < 500) && count < 2,
  })

export function useLinkAnalytics(slug: string, range: AnalyticsRange = {}) {
  return useQuery(analyticsOptions(slug, range))
}
