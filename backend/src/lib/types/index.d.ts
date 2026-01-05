declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number

        DATABASE_URL: string

        BETTER_AUTH_SECRET: string
        BETTER_AUTH_URL: string
    }
}
