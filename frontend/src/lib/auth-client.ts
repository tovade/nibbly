import { createAuthClient } from 'better-auth/react'
import { apiKey, username } from 'better-auth/plugins'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3001', // The base URL of your auth server,
  plugins: [username(), apiKey()],
})
