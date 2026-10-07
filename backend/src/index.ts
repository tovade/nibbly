import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { authMiddleware } from 'src/lib/services/Auth.ts'
import { requestLogger } from 'src/lib/services/Logger.ts'
import { mainRouter } from 'src/routes/index.route.ts'
import { cors } from '@elysiajs/cors'
import { SERVER_CONFIG } from './config/server.config'
import { apiRouter } from './routes/api.router'
import { startJobs } from './lib/jobs'
import { logger } from './lib/services/Logger'

const app = new Elysia({ adapter: node() })
    .use(
        cors({
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: true,
        })
    )
    .mount(authMiddleware)
    .use(requestLogger)
    .use(mainRouter)
    .use(apiRouter)
    .listen(SERVER_CONFIG.port, ({ hostname, port }) => {
        console.log(`🦊 Elysia is running at ${hostname}:${port}`)
    })

// Not awaited: the API should still serve requests if redis is unreachable
startJobs().catch((error) =>
    logger.error({
        msg: 'Failed to start scheduled jobs',
        error: error.message,
    })
)
