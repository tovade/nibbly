import { and, eq } from 'drizzle-orm'
import { db } from '../database'
import { linksSchema } from '../database/schema'
import type { ErrorResponse, Response } from '../types'
import type { Session, User } from 'better-auth'
import { generateRandomString } from '../utils/functions'
import { isHttpUrl } from '../utils/url'
import { RESERVED_SLUGS } from '../../config/analytics.config'

export class LinkManager {
    constructor() {}

    async getLink(
        slug: string
    ): Promise<Response<typeof linksSchema.$inferSelect>> {
        const data = await db.query.linksSchema.findFirst({
            where: eq(linksSchema.shortCode, slug),
        })

        if (!data) {
            return {
                message: 'No url was found with that slug!',
                errors: ['No url was found with that slug!'],
            } as ErrorResponse
        }

        return {
            message: 'ok',
            data,
        }
    }
    async deleteLink(slug: string, user: User): Promise<Response<null>> {
        const data = await db.query.linksSchema.findFirst({
            where: and(
                eq(linksSchema.shortCode, slug),
                eq(linksSchema.userId, user.id)
            ),
        })

        if (!data) {
            return {
                message: 'No url was found.',
                errors: ['No url was found.'],
            } as ErrorResponse
        }

        await db.delete(linksSchema).where(eq(linksSchema.id, data.id))

        return {
            message: 'ok',
        }
    }

    async getLinksByUser(
        user: User
    ): Promise<Response<(typeof linksSchema.$inferSelect)[]>> {
        const data = await db.query.linksSchema.findMany({
            where: eq(linksSchema.userId, user.id),
        })
        if (!data) {
            return {
                message: 'No data was found.',
                errors: ['No data was found.'],
            } as ErrorResponse
        }

        return {
            message: 'ok',
            data,
        }
    }

    async createLinks({
        link,
        slug,
        session,
    }: {
        link: string
        slug?: string
        session?: Session
    }): Promise<Response<typeof linksSchema.$inferInsert>> {
        // format: 'uri' accepts any scheme (javascript:, data:, ...), and the frontend
        // redirects to this value, so only real web links are allowed
        if (!isHttpUrl(link)) {
            return {
                message: 'Only http and https links are allowed',
                errors: ['Only http and https links are allowed'],
            } as ErrorResponse
        }

        if (slug && RESERVED_SLUGS.has(slug.toLowerCase())) {
            return {
                message: 'That slug is reserved',
                errors: ['That slug is reserved'],
            } as ErrorResponse
        }

        let finalSlug = slug ?? generateRandomString(8)

        let existing = await db.query.linksSchema.findFirst({
            where: eq(linksSchema.shortCode, finalSlug),
        })
        if (finalSlug && existing) {
            return {
                message: 'URL already exists',
                errors: ['URL already exists'],
            } as ErrorResponse
        } else if (existing) {
            let attempts = 0
            const MAX_ATTEMPTS = 5

            while (existing && attempts < MAX_ATTEMPTS) {
                finalSlug = generateRandomString(8)
                existing = await db.query.linksSchema.findFirst({
                    where: eq(linksSchema.shortCode, finalSlug),
                })
                attempts++
            }

            if (existing) {
                return {
                    message: 'Something went wrong. Please try again.',
                    errors: ['Something went wrong. Please try again.'],
                } as ErrorResponse
            }
        }

        const newItem = await db
            .insert(linksSchema)
            .values({
                shortCode: finalSlug,
                originalUrl: link,
                userId: session ? session.userId : null,
            })
            .returning()

        return {
            message: 'Ok',
            data: newItem[0],
        }
    }
}
