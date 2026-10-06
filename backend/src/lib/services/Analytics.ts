import { isBot } from 'isbot'
import geoip from 'geoip-lite'
import { and, eq, gte, lt, sql, desc } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { db } from '../database'
import { clicks, linksSchema } from 'db/schema'
import { logger } from './Logger'
import { ANALYTICS_CONFIG } from '../../config/analytics.config'
import {
    computeVisitorHash,
    enumerateDays,
    normalizeReferrer,
    parseUserAgent,
    resolveRange,
} from '../utils/analytics'
import type { ErrorResponse, Response } from '../types'

export interface ClickData {
    shortCode: string
    ip: string | null
    userAgent: string | null
    referer: string | null
}

export interface BreakdownItem {
    name: string
    count: number
}

export interface LinkAnalytics {
    range: { from: string; to: string }
    summary: { total: number; unique: number }
    timeseries: { date: string; total: number; unique: number }[]
    countries: BreakdownItem[]
    referrers: BreakdownItem[]
    browsers: BreakdownItem[]
    os: BreakdownItem[]
    devices: BreakdownItem[]
}

const TOP_N = 10

export class AnalyticsService {
    constructor() {}

    /**
     * Records a click. Never throws: it runs fire-and-forget after the redirect has
     * been sent, so a failure here must not affect the visitor.
     * The IP is only used in memory (geo lookup and hashing) and is never persisted.
     */
    public async recordClick({
        shortCode,
        ip,
        userAgent,
        referer,
    }: ClickData): Promise<void> {
        try {
            const bot = userAgent ? isBot(userAgent) : false
            const country = ip ? (geoip.lookup(ip)?.country ?? null) : null
            const visitorHash = computeVisitorHash(
                ANALYTICS_CONFIG.salt,
                ip ?? 'unknown',
                userAgent ?? ''
            )

            await db.transaction(async (tx) => {
                // Serialise concurrent first clicks from the same visitor, otherwise
                // two in-flight inserts can both see "no previous click" and both count as unique
                await tx.execute(
                    sql`SELECT pg_advisory_xact_lock(hashtext(${shortCode + ':' + visitorHash}))`
                )

                // Uniqueness is decided inside the INSERT itself so it costs no extra round trip
                const [row] = await tx
                    .insert(clicks)
                    .values({
                        shortCode,
                        userAgent,
                        visitorHash,
                        country,
                        referrer: normalizeReferrer(
                            referer,
                            ANALYTICS_CONFIG.ownHosts
                        ),
                        isBot: bot,
                        isUnique: bot
                            ? false
                            : sql`NOT EXISTS (
                                SELECT 1 FROM clicks c
                                WHERE c.short_code = ${shortCode}
                                AND c.visitor_hash = ${visitorHash}
                                AND c.is_bot = false
                            )`,
                        ...parseUserAgent(userAgent),
                    })
                    .returning({ isUnique: clicks.isUnique })

                if (bot) return

                await tx
                    .update(linksSchema)
                    .set({
                        totalClicks: sql`${linksSchema.totalClicks} + 1`,
                        uniqueClicks: sql`${linksSchema.uniqueClicks} + ${row?.isUnique ? 1 : 0}`,
                    })
                    .where(eq(linksSchema.shortCode, shortCode))
            })
        } catch (error) {
            logger.error({
                msg: 'Failed to record click',
                shortCode,
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    public async getLinkAnalytics(
        shortCode: string,
        query: { from?: string; to?: string } = {}
    ): Promise<Response<LinkAnalytics>> {
        const range = resolveRange(query.from, query.to, {
            defaultDays: ANALYTICS_CONFIG.defaultRangeDays,
            maxDays: ANALYTICS_CONFIG.maxRangeDays,
        })

        const where = and(
            eq(clicks.shortCode, shortCode),
            eq(clicks.isBot, false),
            gte(clicks.clickedAt, range.start),
            lt(clicks.clickedAt, range.end)
        )

        const breakdown = async (
            column: AnyPgColumn,
            fallback: string
        ): Promise<BreakdownItem[]> => {
            const name = sql<string>`coalesce(${column}, ${fallback})`
            const count = sql<number>`count(*)::int`
            const rows = await db
                .select({ name, count })
                .from(clicks)
                .where(where)
                .groupBy(sql`1`)
                .orderBy(desc(count))

            const top = rows.slice(0, TOP_N)
            const rest = rows
                .slice(TOP_N)
                .reduce((sum, row) => sum + row.count, 0)

            return rest > 0 ? [...top, { name: 'Other', count: rest }] : top
        }

        try {
            const day = sql<string>`to_char(${clicks.clickedAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`
            const [perDay, countries, referrers, browsers, os, devices] =
                await Promise.all([
                    db
                        .select({
                            date: day,
                            total: sql<number>`count(*)::int`,
                            unique: sql<number>`count(*) filter (where ${clicks.isUnique})::int`,
                        })
                        .from(clicks)
                        .where(where)
                        .groupBy(day),
                    breakdown(clicks.country, 'Unknown'),
                    breakdown(clicks.referrer, 'Direct'),
                    breakdown(clicks.browser, 'Unknown'),
                    breakdown(clicks.os, 'Unknown'),
                    breakdown(clicks.device, 'Unknown'),
                ])

            const byDay = new Map(perDay.map((row) => [row.date, row]))
            const timeseries = enumerateDays(range.from, range.to).map(
                (date) => ({
                    date,
                    total: byDay.get(date)?.total ?? 0,
                    unique: byDay.get(date)?.unique ?? 0,
                })
            )

            return {
                message: 'ok',
                data: {
                    range: { from: range.from, to: range.to },
                    summary: {
                        total: timeseries.reduce((s, d) => s + d.total, 0),
                        unique: timeseries.reduce((s, d) => s + d.unique, 0),
                    },
                    timeseries,
                    countries,
                    referrers,
                    browsers,
                    os,
                    devices,
                },
            }
        } catch (error) {
            logger.error({
                msg: 'Failed to load analytics',
                shortCode,
                error: error instanceof Error ? error.message : 'Unknown error',
            })
            return {
                message: 'Could not load analytics.',
                errors: ['Could not load analytics.'],
            } as ErrorResponse
        }
    }

    public async clearStatisticsBySlug(
        shortCode: string
    ): Promise<Response<null>> {
        await db.transaction(async (tx) => {
            await tx.delete(clicks).where(eq(clicks.shortCode, shortCode))
            await tx
                .update(linksSchema)
                .set({ totalClicks: 0, uniqueClicks: 0 })
                .where(eq(linksSchema.shortCode, shortCode))
        })

        return {
            message: 'ok',
        }
    }
}
