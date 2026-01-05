import { createAuthClient } from 'better-auth/react'
import { apiKey, username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3001', // The base URL of your auth server,
  plugins: [username(), apiKey(), tanstackStartCookies()],
})
