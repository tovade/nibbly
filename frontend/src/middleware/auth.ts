import { authClient } from '@/lib/auth-client'
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await authClient.getSession({
    fetchOptions: {
      headers,
    },
  })

  if (!session.data) {
    throw redirect({ to: '/auth/login' })
  }

  return await next()
})
