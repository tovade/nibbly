import Elysia, { NotFoundError, t } from 'elysia'
import { db } from '../lib/database/'
import { and, eq } from 'drizzle-orm'
import { linksSchema } from '../lib/database/schema'
import { generateRandomString } from '../lib/utils/functions'
import { auth, authMacro } from '../lib/services/Auth'

export const apiRouter = new Elysia({ name: 'API', prefix: '/api' })
    .use(authMacro)
    .get('/:slug', async ({ params, status }) => {
        const dbItem = await db.query.linksSchema.findFirst({
            where: eq(linksSchema.shortCode, params.slug),
        })

        if (!dbItem)
            return status(404, {
                error: 'No url exists with that code!',
            })

        return status(200, {
            message: 'Ok',
            data: {
                originalUrl: dbItem.orginalUrl,
                shortCode: dbItem.shortCode,
            },
        })
    })
    .delete(
        '/:slug',
        async ({ params, status, user }) => {
            const dbItem = await db.query.linksSchema.findFirst({
                where: and(
                    eq(linksSchema.shortCode, params.slug),
                    eq(linksSchema.userId, user.id)
                ),
            })
            if (!dbItem)
                return status(404, {
                    error: 'Link not found.',
                })

            await db.delete(linksSchema).where(eq(linksSchema.id, dbItem.id))
            return status(200, {
                message: 'Ok',
            })
        },
        {
            auth: true,
        }
    )
    .get('/list/:userId', async ({ params, status }) => {
        const dbItem = await db.query.linksSchema.findMany({
            where: eq(linksSchema.userId, params.userId),
        })

        if (!dbItem)
            return status(404, {
                error: "This user doesn't exist",
            })

        return status(200, {
            message: 'Ok',
            data: dbItem,
        })
    })
    .post(
        '/shorten/',
        async ({ body, status, headers }) => {
            let slug = body.slug ?? generateRandomString(8)

            let existing = await db.query.linksSchema.findFirst({
                where: eq(linksSchema.shortCode, slug),
            })
            if (body.slug && existing) {
                return status(400, {
                    error: 'URL already exists!',
                })
            } else if (existing) {
                let attempts = 0
                const MAX_ATTEMPTS = 5

                while (existing && attempts < MAX_ATTEMPTS) {
                    slug = generateRandomString(8)
                    existing = await db.query.linksSchema.findFirst({
                        where: eq(linksSchema.shortCode, slug),
                    })
                    attempts++
                }

                if (existing) {
                    return status(500, {
                        error: 'Could not generate a unique short code. Please try again.',
                    })
                }
            }

            const session = await auth.api.getSession({
                headers,
            })

            await db.insert(linksSchema).values({
                shortCode: slug,
                orginalUrl: body.link,
                userId: session ? session.user.id : null,
            })

            return status(200, {
                message: 'ok',
                data: {
                    shortCode: slug,
                    originalUrl: body.link,
                },
            })
        },
        {
            body: t.Object({
                slug: t.Optional(t.String()),
                link: t.String({ format: 'uri' }),
            }),
        }
    )
    .get('/:slug/analytics', () => {
        //TODO: complete this
        return 'Under construction'
    })
