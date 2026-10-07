const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')

export const REDIS_CONFIG = {
    // Handed to BullMQ as plain options so it manages its own connections
    // (a Worker needs a dedicated blocking connection anyway)
    connection: {
        host: url.hostname,
        port: Number(url.port || 6379),
        username: url.username ? decodeURIComponent(url.username) : undefined,
        password: url.password ? decodeURIComponent(url.password) : undefined,
        db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
        // Required by BullMQ for workers: blocking commands must never be retried-out
        maxRetriesPerRequest: null,
    },
}

export const JOBS_CONFIG = {
    // Set JOBS_ENABLED=false to run the API without starting the scheduler/workers
    // (e.g. when jobs run in a dedicated process)
    enabled: process.env.JOBS_ENABLED !== 'false',
    // All keys in redis are prefixed with this so several apps/envs can share an instance
    prefix: process.env.JOBS_PREFIX ?? 'nibbly',
    // Orphaned links (no owner) are removed after this many days
    orphanedLinkMaxAgeDays: 30,
}
