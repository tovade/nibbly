import { betterAuth } from 'better-auth'
import { AUTH_CONFIG } from 'src/config/auth.config.ts'
import { Elysia } from 'elysia'

export const auth = betterAuth(AUTH_CONFIG)

export const authMiddleware = new Elysia({ name: 'better-auth' }).mount(
    auth.handler
)

export const authMacro = new Elysia({ name: 'auth-macro' }).macro({
    auth: {
        async resolve({ status, request: { headers } }) {
            const session = await auth.api.getSession({
                headers,
            })
            if (!session) return status(401)
            return {
                user: session.user,
                session: session.session,
            }
        },
    },
})
