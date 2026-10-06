import Elysia, { t } from 'elysia'
import { isError } from '../lib/utils/functions'
import { auth, authMacro } from '../lib/services/Auth'
import { LinkManager } from 'src/lib/services/Links'
import { AnalyticsService } from 'src/lib/services/Analytics'
import { getClientIp } from '../lib/utils/request'
import { isHttpUrl } from '../lib/utils/url'

export const apiRouter = new Elysia({ name: 'API', prefix: '/api' })
    .use(authMacro)
    .decorate('linkManager', new LinkManager())
    .decorate('analyticsService', new AnalyticsService())
    .get('/:slug', async ({ params, status, linkManager }) => {
        const resp = await linkManager.getLink(params.slug)
        if (isError(resp)) return status(404, resp)

        return status(200, resp)
    })
    // Called by the frontend /:slug page, from the visitor's own browser, so the request
    // carries the visitor's real IP and user agent. This is the only place a click is counted.
    .post(
        '/:slug/visit',
        async ({
            params,
            body,
            request,
            server,
            status,
            linkManager,
            analyticsService,
        }) => {
            const resp = await linkManager.getLink(params.slug)
            const originalUrl = isError(resp) ? null : resp.data?.originalUrl
            if (!originalUrl || !isHttpUrl(originalUrl)) {
                return status(404, {
                    message: 'No url was found with that slug!',
                    errors: ['No url was found with that slug!'],
                })
            }

            // Not awaited on purpose: recording must never delay the redirect
            void analyticsService.recordClick({
                shortCode: params.slug,
                ip: getClientIp(request, server),
                userAgent: request.headers.get('user-agent'),
                // The Referer header here is our own frontend page, so the page sends
                // the visitor's real document.referrer in the body instead
                referer: body?.referrer ?? null,
            })

            return status(200, { message: 'ok', data: { originalUrl } })
        },
        {
            body: t.Optional(
                t.Object({
                    referrer: t.Optional(t.String({ maxLength: 2048 })),
                })
            ),
        }
    )
    .delete(
        '/:slug',
        async ({ params, status, user, linkManager }) => {
            const resp = await linkManager.deleteLink(params.slug, user)
            if (isError(resp)) return status(404, resp)

            return status(200, resp)
        },
        {
            auth: true,
        }
    )
    .get(
        '/list/',
        async ({ params, status, linkManager, user }) => {
            const resp = await linkManager.getLinksByUser(user)
            if (isError(resp)) return status(404, resp)

            return status(200, resp)
        },
        { auth: true }
    )
    .post(
        '/shorten/',
        async ({ body, status, headers, linkManager }) => {
            const session = await auth.api.getSession({
                headers,
            })
            const resp = await linkManager.createLinks({
                session: session?.session,
                ...body,
            })
            if (isError(resp)) return status(500, resp)

            return status(200, resp)
        },
        {
            body: t.Object({
                slug: t.Optional(t.String()),
                link: t.String({ format: 'uri' }),
            }),
        }
    )
    .get(
        '/:slug/analytics',
        async ({
            params,
            query,
            user,
            linkManager,
            analyticsService,
            status,
        }) => {
            const link = await linkManager.getLink(params.slug)
            if (isError(link)) return status(404, link)
            // Anonymous links have no owner, so nobody can read their analytics
            if (!link.data?.userId || link.data.userId !== user.id)
                return status(403, {
                    message: 'You do not have access to this link.',
                    errors: ['You do not have access to this link.'],
                })

            const resp = await analyticsService.getLinkAnalytics(
                params.slug,
                query
            )
            if (isError(resp)) return status(500, resp)

            return status(200, resp)
        },
        {
            auth: true,
            query: t.Object({
                from: t.Optional(t.String({ format: 'date' })),
                to: t.Optional(t.String({ format: 'date' })),
            }),
        }
    )
    .delete(
        '/:slug/analytics',
        async ({ params, user, linkManager, analyticsService, status }) => {
            const link = await linkManager.getLink(params.slug)
            if (isError(link)) return status(404, link)
            if (!link.data?.userId || link.data.userId !== user.id)
                return status(403, {
                    message: 'You do not have access to this link.',
                    errors: ['You do not have access to this link.'],
                })

            return status(
                200,
                await analyticsService.clearStatisticsBySlug(params.slug)
            )
        },
        { auth: true }
    )
