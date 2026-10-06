import {
    pgTable,
    text,
    timestamp,
    boolean,
    jsonb,
    index,
} from 'drizzle-orm/pg-core'
import { linksSchema } from 'db/schema/links.schema.ts'
import { randomUUID } from 'node:crypto'

export const clicks = pgTable(
    'clicks',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        shortCode: text('short_code')
            .notNull()
            .references(() => linksSchema.shortCode, { onDelete: 'cascade' }),

        clickedAt: timestamp('clicked_at', { withTimezone: true })
            .defaultNow()
            .notNull(),

        userAgent: text('user_agent'),

        // The raw IP is never stored. This is HMAC(daily salt, ip|ua), so it
        // cannot be linked across days. "Unique" therefore means unique per day.
        visitorHash: text('visitor_hash'),

        country: text('country'),
        // Hostname of the Referer header, null means direct traffic
        referrer: text('referrer'),

        device: text('device'),
        deviceModel: text('device_model'),
        browser: text('browser'),
        browserVersion: text('browser_version'),
        os: text('os'),
        osVersion: text('os_version'),

        isUnique: boolean('is_unique').default(false).notNull(),
        isBot: boolean('is_bot').default(false).notNull(),
    },
    (table) => [
        index('clicks_short_code_clicked_at_idx').on(
            table.shortCode,
            table.clickedAt
        ),
        index('clicks_short_code_visitor_hash_idx').on(
            table.shortCode,
            table.visitorHash
        ),
    ]
)

//PLAN: Use this for moderation actions as logging, with proof and shit... Maybe other stuff???
export const analyticsEvents = pgTable('analytics_events', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    eventName: text('event_name').notNull(),
    userId: text('user_id'),
    sessionId: text('session_id'),

    properties: jsonb('properties'),

    timestamp: timestamp('timestamp').defaultNow().notNull(),
    path: text('path'),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
})
