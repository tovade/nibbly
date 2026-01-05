import { pgTable, serial, text, date } from 'drizzle-orm/pg-core'
import { linksSchema } from 'db/schema/links.schema.ts'

export const analyticsSchema = pgTable('urls', {
    id: serial('id').primaryKey(),
    urlId: text('url_id').references(() => linksSchema.shortCode, {
        onDelete: 'cascade',
    }),
    referrer: text('referrer'),
    country: text('country'),
    ipAddress: text('ip_address'),
    timestamp: date('timestamp').default(new Date().toString()),
})
