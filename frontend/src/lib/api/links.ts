import { env } from '@/env'
import { DataResponse, ErrorResponse } from './base'

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
  getAllLinks: async (userId: string) => {
    const res = await fetch(`${env.VITE_BACKEND_URL}/api/list/${userId}`)
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

export type LinkResponse = ErrorResponse | DataResponse<LinkData>

export type LinkData = {
  shortCode: string
  originalUrl: string
}

export type RawLink = {
  id: number
  userId: string
  shortCode: string
  orginalUrl: string
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

export type LinkListResponse = ErrorResponse | DataResponse<RawLink[]>
