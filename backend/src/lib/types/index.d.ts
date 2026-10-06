declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number

        DATABASE_URL: string

        BETTER_AUTH_SECRET: string
        BETTER_AUTH_URL: string

        ANALYTICS_SALT: string
        TRUST_PROXY?: string
    }
}

export type ErrorResponse = {
    errors: string[]
    message: string
}

export type DataResponse<T = any> = {
    message: string
    data?: T
}

export type Response<T> = ErrorResponse | DataResponse<T>
