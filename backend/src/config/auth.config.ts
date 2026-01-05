import type { BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from 'db/index.ts'
import { apiKey, username } from 'better-auth/plugins'

//TODO: add in email stuff (verification, change account email, etc...)
export const AUTH_CONFIG: BetterAuthOptions = {
    database: drizzleAdapter(db, {
        provider: 'pg', // or "mysql", "sqlite"
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    },

    plugins: [username(), apiKey()],
}
