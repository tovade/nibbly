import { createHmac } from 'node:crypto'
import { UAParser } from 'ua-parser-js'

const DAY_MS = 24 * 60 * 60 * 1000

export function parseUserAgent(userAgent?: string | null) {
    if (!userAgent) {
        return {
            device: 'unknown',
            deviceModel: null,
            browser: 'unknown',
            browserVersion: null,
            os: 'unknown',
            osVersion: null,
        }
    }

    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const browser = parser.getBrowser()
    const os = parser.getOS()

    return {
        device: device.type || 'desktop',
        deviceModel: device.model || null,
        browser: browser.name || 'unknown',
        browserVersion: browser.version || null,
        os: os.name || 'unknown',
        osVersion: os.version || null,
    }
}

/**
 * Reduces a Referer header to its hostname. Returns null for direct traffic,
 * unparseable values, and self-referrals (any host in `ownHosts`).
 */
export function normalizeReferrer(
    referer?: string | null,
    ownHosts: string[] = []
): string | null {
    if (!referer) return null

    let hostname: string
    try {
        hostname = new URL(referer).hostname.toLowerCase()
    } catch {
        return null
    }

    hostname = hostname.replace(/^www\./, '')
    if (!hostname) return null
    if (
        ownHosts.some((h) => h.toLowerCase().replace(/^www\./, '') === hostname)
    )
        return null

    return hostname
}

/**
 * HMAC(secret + UTC date, ip|ua). The date is part of the key so the hash rotates
 * daily and visitors cannot be tracked across days.
 */
export function computeVisitorHash(
    salt: string,
    ip: string,
    userAgent: string,
    date: Date = new Date()
): string {
    const day = date.toISOString().slice(0, 10)
    return createHmac('sha256', `${salt}:${day}`)
        .update(`${ip}|${userAgent}`)
        .digest('hex')
}

function isIsoDate(value?: string): value is string {
    return (
        !!value &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !isNaN(Date.parse(value))
    )
}

/**
 * Turns optional `from`/`to` (YYYY-MM-DD, inclusive, UTC) into a bounded range.
 * `end` is exclusive (midnight after `to`), which is what the SQL filter uses.
 */
export function resolveRange(
    from: string | undefined,
    to: string | undefined,
    { defaultDays, maxDays }: { defaultDays: number; maxDays: number },
    now: Date = new Date()
) {
    const today = new Date(now.toISOString().slice(0, 10))
    const toDate = isIsoDate(to) ? new Date(to) : today
    let fromDate = isIsoDate(from)
        ? new Date(from)
        : new Date(toDate.getTime() - (defaultDays - 1) * DAY_MS)

    if (fromDate > toDate) fromDate = new Date(toDate)

    const earliest = new Date(toDate.getTime() - (maxDays - 1) * DAY_MS)
    if (fromDate < earliest) fromDate = earliest

    return {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
        start: fromDate,
        end: new Date(toDate.getTime() + DAY_MS),
    }
}

/** Every YYYY-MM-DD from `from` to `to`, inclusive. */
export function enumerateDays(from: string, to: string): string[] {
    const days: string[] = []
    for (let t = Date.parse(from); t <= Date.parse(to); t += DAY_MS) {
        days.push(new Date(t).toISOString().slice(0, 10))
    }
    return days
}
