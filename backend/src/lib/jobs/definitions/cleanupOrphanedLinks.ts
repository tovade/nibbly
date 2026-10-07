import { and, inArray, isNull, lt } from 'drizzle-orm'
import { db } from '../../database'
import { linksSchema } from '../../database/schema'
import { JOBS_CONFIG } from '../../../config/redis.config'
import type { JobDefinition } from '../types'

const BATCH_SIZE = 1000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Deletes short links that have no owner and are older than the configured age.
 * Their click rows go with them (clicks.short_code cascades).
 * Links with a user are never touched, nor are rows without a createdAt.
 */
export async function deleteOrphanedLinks(
    now = new Date(),
    maxAgeDays = JOBS_CONFIG.orphanedLinkMaxAgeDays
) {
    const cutoff = new Date(now.getTime() - maxAgeDays * DAY_MS)
    const where = and(
        isNull(linksSchema.userId),
        lt(linksSchema.createdAt, cutoff)
    )

    // Batched so a big backlog doesn't hold one huge lock/transaction
    let deleted = 0
    while (true) {
        const batch = await db
            .select({ id: linksSchema.id })
            .from(linksSchema)
            .where(where)
            .limit(BATCH_SIZE)

        if (batch.length === 0) break

        // Re-check the condition on delete in case a link got claimed in between
        const removed = await db
            .delete(linksSchema)
            .where(
                and(
                    where,
                    inArray(
                        linksSchema.id,
                        batch.map((row) => row.id)
                    )
                )
            )
            .returning({ id: linksSchema.id })

        deleted += removed.length
        if (batch.length < BATCH_SIZE) break
    }

    return { deleted, cutoff: cutoff.toISOString() }
}

export const cleanupOrphanedLinks: JobDefinition<
    undefined,
    Awaited<ReturnType<typeof deleteOrphanedLinks>>
> = {
    name: 'cleanup-orphaned-links',
    // every day at 03:00
    cron: '0 3 * * *',
    handler: () => deleteOrphanedLinks(),
}
