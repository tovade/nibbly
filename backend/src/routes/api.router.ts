import Elysia, { t } from 'elysia'
import { isError } from '../lib/utils/functions'
import { auth, authMacro } from '../lib/services/Auth'
import { LinkManager } from 'src/lib/services/Links'

export const apiRouter = new Elysia({ name: 'API', prefix: '/api' })
    .use(authMacro)
    .decorate('linkManager', new LinkManager())
    .get('/:slug', async ({ params, status, linkManager }) => {
        const resp = await linkManager.getLink(params.slug)
        if (isError(resp)) return status(404, resp)

        return status(200, resp)
    })
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
            if (isError(resp)) return status(404, resp)

            return status(200, resp)
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
