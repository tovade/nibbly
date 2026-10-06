const salt = process.env.ANALYTICS_SALT

if (!salt) {
    throw new Error(
        'ANALYTICS_SALT is not set. Generate a long random string and add it to your .env'
    )
}

function hostnameOf(url?: string): string[] {
    try {
        return url ? [new URL(url).hostname] : []
    } catch {
        return []
    }
}

export const ANALYTICS_CONFIG = {
    salt,
    // Only trust proxy headers (x-forwarded-for etc.) when running behind a proxy you control
    trustProxy: process.env.TRUST_PROXY === 'true',
    // Referrers from our own app are treated as direct traffic
    ownHosts: hostnameOf(process.env.BETTER_AUTH_URL),
    defaultRangeDays: 30,
    maxRangeDays: 365,
}

// Short links are served from the frontend root (/:slug), so these would collide
// with real frontend routes, backend routes or well-known files
export const RESERVED_SLUGS = new Set([
    'api',
    'health',
    'auth',
    'dashboard',
    'login',
    'signup',
    'register',
    'links',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
])
