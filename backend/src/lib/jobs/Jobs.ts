import { Queue, Worker, type Job } from 'bullmq'
import { JOBS_CONFIG, REDIS_CONFIG } from '../../config/redis.config'
import { logger } from '../services/Logger'
import type { JobDefinition } from './types'

const QUEUE_NAME = 'scheduled'

/**
 * Owns the single "scheduled" queue, registers every job definition as a
 * BullMQ job scheduler (cron) and runs the worker that executes them.
 *
 * Schedulers are upserted by id, so starting several instances is safe:
 * redis holds one schedule and each run is picked up by exactly one worker.
 */
export class JobManager {
    private queue?: Queue
    private worker?: Worker
    private readonly definitions = new Map<string, JobDefinition<any, any>>()

    register(definition: JobDefinition<any, any>) {
        if (this.definitions.has(definition.name)) {
            throw new Error(`Job "${definition.name}" is already registered`)
        }
        this.definitions.set(definition.name, definition)
        return this
    }

    async start() {
        const common = {
            connection: REDIS_CONFIG.connection,
            prefix: JOBS_CONFIG.prefix,
        }

        this.queue = new Queue(QUEUE_NAME, {
            ...common,
            defaultJobOptions: {
                // Keep a little history for debugging without growing redis forever
                removeOnComplete: { count: 50 },
                removeOnFail: { count: 200 },
            },
        })
        this.queue.on('error', (error) =>
            logger.error({ msg: 'Job queue error', error: error.message })
        )

        // Drop schedulers whose job no longer exists in code
        const known = new Set(this.definitions.keys())
        for (const scheduler of await this.queue.getJobSchedulers()) {
            if (scheduler.key && !known.has(scheduler.key)) {
                await this.queue.removeJobScheduler(scheduler.key)
                logger.info({
                    msg: 'Removed stale job scheduler',
                    job: scheduler.key,
                })
            }
        }

        for (const definition of this.definitions.values()) {
            await this.queue.upsertJobScheduler(
                definition.name,
                { pattern: definition.cron, tz: definition.timezone },
                {
                    name: definition.name,
                    opts: {
                        attempts: definition.attempts ?? 3,
                        backoff: { type: 'exponential', delay: 30_000 },
                    },
                }
            )
            logger.info({
                msg: 'Scheduled job',
                job: definition.name,
                cron: definition.cron,
            })
        }

        const maxConcurrency = Math.max(
            1,
            ...[...this.definitions.values()].map((d) => d.concurrency ?? 1)
        )

        this.worker = new Worker(QUEUE_NAME, (job) => this.process(job), {
            ...common,
            concurrency: maxConcurrency,
        })
        this.worker.on('error', (error) =>
            logger.error({ msg: 'Job worker error', error: error.message })
        )
        this.worker.on('completed', (job, result) =>
            logger.info({ msg: 'Job completed', job: job.name, result })
        )
        this.worker.on('failed', (job, error) =>
            logger.error({
                msg: 'Job failed',
                job: job?.name,
                attempt: job?.attemptsMade,
                error: error.message,
            })
        )
    }

    private async process(job: Job) {
        const definition = this.definitions.get(job.name)
        if (!definition) {
            throw new Error(`No handler registered for job "${job.name}"`)
        }
        return definition.handler(job)
    }

    /** Runs a registered job right now, outside its schedule (handy for testing/admin) */
    async runNow(name: string) {
        if (!this.queue) throw new Error('JobManager has not been started')
        if (!this.definitions.has(name)) {
            throw new Error(`Unknown job "${name}"`)
        }
        return this.queue.add(name, undefined)
    }

    /** Lets running jobs finish, then closes redis connections */
    async stop() {
        await this.worker?.close()
        await this.queue?.close()
    }
}
