import { Elysia } from 'elysia'
import { pino, type TransportTargetOptions } from 'pino'

const levels = {
    development: 'debug',
    test: 'error',
    production: 'info',
}

const isDevelopment = process.env.NODE_ENV === 'development'

const targets: TransportTargetOptions[] = [
    {
        target: 'pino/file',
        options: { destination: './logs/app.log', mkdir: true },
        level: 'info',
    },
]

if (isDevelopment) {
    targets.push({
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
        level: 'debug',
    })
}

export const logger = pino({
    level: levels[process.env.NODE_ENV as keyof typeof levels] || 'info',
    base: {
        env: process.env.NODE_ENV,
        service: 'elysia-api',
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    transport: { targets },
})

export const requestLogger = new Elysia({ name: 'RequestLogger' })
    .onRequest(({ request }) => {
        logger.info({
            msg: 'Incoming request',
            method: request.method,
            url: request.url,
            headers: {
                'user-agent': request.headers.get('user-agent'),
                'content-type': request.headers.get('content-type'),
            },
        })
    })

    .onAfterResponse(({ request, set }) => {
        logger.info({
            msg: 'Outgoing response',
            method: request.method,
            url: request.url,
            status: set.status,
        })
    })

    .onError(({ request, error, code }) => {
        logger.error({
            msg: 'Request error',
            method: request.method,
            url: request.url,
            code,
            error: 'message' in error ? error.message : 'Unknown error',
            stack:
                process.env.NODE_ENV === 'development' && 'stack' in error
                    ? error.stack
                    : undefined,
        })
    })
