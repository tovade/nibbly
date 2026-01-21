import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { user } from 'db/schema/auth.schema.ts'

export const linksSchema = pgTable('urls', {
    id: serial('id').primaryKey(),
    shortCode: text('shortCode').unique(),
    originalUrl: text('originalUrl'),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    clickCount: integer('click_count').default(0),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt')
        .defaultNow()
        .$onUpdate(() => new Date()),
})
