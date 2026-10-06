import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { isError } from './base'
import type { DataResponse, ErrorResponse } from './base'
import { env } from '@/env'

// Short links are served by the frontend's /$slug page, so they live on this app's own origin.
// Browser only: call this from event handlers, not during render (SSR has no window).
export function getShortUrl(shortCode: string) {
  return `${window.location.origin}/${shortCode}`
}

// API
export const linkAPI = {
  createShortURL: async (link: string, slug?: string) => {
    const data = slug ? { link, slug } : { link }
    const res = await fetch(`${env.VITE_BACKEND_URL}/api/shorten`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })

    const dataResponse: LinkResponse = await res.json()

    return {
      request: res,
      data: dataResponse,
    }
  },
  getShortURL: async (slug: string) => {
    const res = await fetch(`${env.VITE_BACKEND_URL}/api/${slug}`)

    const dataResponse: LinkResponse = await res.json()

    return {
      request: res,
      data: dataResponse,
    }
  },
  // Resolves the destination AND records the click. It must be called from the
  // visitor's own browser so the backend sees their real IP and user agent.
  visitShortURL: async (slug: string, referrer: string) => {
    const res = await fetch(
      `${env.VITE_BACKEND_URL}/api/${encodeURIComponent(slug)}/visit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(referrer ? { referrer } : {}),
      },
    )
    const dataResponse: VisitResponse = await res
      .json()
      .catch(() => ({
        message: 'Unexpected response',
        errors: ['Unexpected response'],
      }))

    return {
      request: res,
      data: dataResponse,
    }
  },
  getAllLinks: async () => {
    const res = await fetch(`${env.VITE_BACKEND_URL}/api/list/`, {
      credentials: 'include',
    })
    const dataResponse: LinkListResponse = await res.json()

    return {
      request: res,
      data: dataResponse,
    }
  },
  deleteLink: async (slug: string) => {
    const res = await fetch(`${env.VITE_BACKEND_URL}/api/${slug}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const dataResponse: DataResponse<null> = await res.json()

    return {
      request: res,
      data: dataResponse,
    }
  },
}

// hooks

export function useLink(slug: string) {
  return useQuery({
    queryKey: [`link:${slug}`],
    queryFn: async () => {
      const { request, data } = await linkAPI.getShortURL(slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
  })
}

export const linkOptions = (slug: string) =>
  queryOptions({
    queryKey: ['link', slug],
    queryFn: async () => {
      const { request, data } = await linkAPI.getShortURL(slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
  })

export function useUserLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { request, data } = await linkAPI.getAllLinks()

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
  })
}

export function useLinkCreation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ link, slug }: { link: string; slug?: string }) => {
      const { request, data } = await linkAPI.createShortURL(link, slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })
}
export function useLinkDeletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ slug }: { slug: string }) => {
      const { request, data } = await linkAPI.deleteLink(slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })
}

// types
export type LinkResponse = ErrorResponse | DataResponse<LinkData>

export type LinkData = {
  shortCode: string
  originalUrl: string
}

export type VisitResponse =
  | ErrorResponse
  | DataResponse<{ originalUrl: string }>

export type RawLink = {
  id: number
  userId: string
  shortCode: string
  originalUrl: string
  totalClicks: number
  uniqueClicks: number
  createdAt: Date
  updatedAt: Date
}

export type LinkListResponse = ErrorResponse | DataResponse<Array<RawLink>>
