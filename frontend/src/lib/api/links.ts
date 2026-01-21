import { env } from '@/env'
import { DataResponse, ErrorResponse, isError } from './base'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: async ({ link, slug }: { link: string; slug?: string }) => {
      const { request, data } = await linkAPI.createShortURL(link, slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
  })
}
export function useLinkDeletion() {
  return useMutation({
    mutationFn: async ({ slug }: { slug: string }) => {
      const { request, data } = await linkAPI.deleteLink(slug)

      if (!request.ok || isError(data)) {
        throw new Error((data as ErrorResponse).message)
      }

      return data
    },
  })
}

// types
export type LinkResponse = ErrorResponse | DataResponse<LinkData>

export type LinkData = {
  shortCode: string
  originalUrl: string
}

export type RawLink = {
  id: number
  userId: string
  shortCode: string
  originalUrl: string
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

export type LinkListResponse = ErrorResponse | DataResponse<RawLink[]>
