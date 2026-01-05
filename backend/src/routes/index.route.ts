import { Elysia } from 'elysia'

export const mainRouter = new Elysia({ name: 'MainRouter' }).get(
    '/health',
    () => 'OK'
)
