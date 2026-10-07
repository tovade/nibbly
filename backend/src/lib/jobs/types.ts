import type { Job } from 'bullmq'

export type JobDefinition<Data = undefined, Result = unknown> = {
    /** Unique name, also used as the job scheduler id */
    name: string
    /** Cron expression (https://crontab.guru), evaluated in `timezone` */
    cron: string
    timezone?: string
    handler: (job: Job<Data, Result>) => Promise<Result>
    /** Max jobs of this type processed at once by this process */
    concurrency?: number
    /** Retries after a failure, with exponential backoff. Default: 3 attempts */
    attempts?: number
}
