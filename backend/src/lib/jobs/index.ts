import { JOBS_CONFIG } from '../../config/redis.config'
import { logger } from '../services/Logger'
import { JobManager } from './Jobs'
import { cleanupOrphanedLinks } from './definitions/cleanupOrphanedLinks'

export const jobManager = new JobManager().register(cleanupOrphanedLinks)

/** Starts schedulers + worker, and stops them cleanly on shutdown */
export async function startJobs() {
    if (!JOBS_CONFIG.enabled) {
        logger.info({ msg: 'Scheduled jobs are disabled (JOBS_ENABLED=false)' })
        return
    }

    await jobManager.start()

    const shutdown = async () => {
        await jobManager.stop()
        process.exit(0)
    }
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
}
