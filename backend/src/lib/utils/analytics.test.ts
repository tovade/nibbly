import { describe, expect, test } from 'bun:test'
import { isBot } from 'isbot'
import {
    computeVisitorHash,
    enumerateDays,
    normalizeReferrer,
    parseUserAgent,
    resolveRange,
} from './analytics'
import { isHttpUrl } from './url'

describe('normalizeReferrer', () => {
    test('reduces a url to its hostname and strips www', () => {
        expect(normalizeReferrer('https://www.Example.com/a?b=c')).toBe(
            'example.com'
        )
    })

    test('null for direct, garbage and self referrals', () => {
        expect(normalizeReferrer(null)).toBeNull()
        expect(normalizeReferrer('not a url')).toBeNull()
        expect(
            normalizeReferrer('https://bite.test/dashboard', ['bite.test'])
        ).toBeNull()
    })
})

describe('computeVisitorHash', () => {
    const day = new Date('2026-01-01T12:00:00Z')

    test('is deterministic within a day', () => {
        const a = computeVisitorHash('salt', '1.2.3.4', 'ua', day)
        const b = computeVisitorHash(
            'salt',
            '1.2.3.4',
            'ua',
            new Date('2026-01-01T23:59:00Z')
        )
        expect(a).toBe(b)
    })

    test('rotates daily and varies by ip, ua and salt', () => {
        const base = computeVisitorHash('salt', '1.2.3.4', 'ua', day)
        const nextDay = new Date('2026-01-02T00:00:00Z')
        expect(computeVisitorHash('salt', '1.2.3.4', 'ua', nextDay)).not.toBe(
            base
        )
        expect(computeVisitorHash('salt', '1.2.3.5', 'ua', day)).not.toBe(base)
        expect(computeVisitorHash('salt', '1.2.3.4', 'ua2', day)).not.toBe(base)
        expect(computeVisitorHash('salt2', '1.2.3.4', 'ua', day)).not.toBe(base)
    })

    test('does not contain the raw ip', () => {
        expect(computeVisitorHash('salt', '1.2.3.4', 'ua', day)).not.toContain(
            '1.2.3.4'
        )
    })
})

describe('parseUserAgent', () => {
    test('handles missing ua', () => {
        expect(parseUserAgent(null).browser).toBe('unknown')
    })

    test('parses a desktop chrome ua', () => {
        const parsed = parseUserAgent(
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        expect(parsed.browser).toBe('Chrome')
        expect(parsed.device).toBe('desktop')
    })
})

describe('bot detection', () => {
    test('flags crawlers but not browsers', () => {
        expect(
            isBot(
                'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            )
        ).toBe(true)
        expect(
            isBot(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
        ).toBe(false)
    })
})

describe('resolveRange', () => {
    const opts = { defaultDays: 30, maxDays: 365 }
    const now = new Date('2026-03-31T10:00:00Z')

    test('defaults to the last 30 days inclusive of today', () => {
        const r = resolveRange(undefined, undefined, opts, now)
        expect(r.to).toBe('2026-03-31')
        expect(r.from).toBe('2026-03-02')
        expect(r.end.toISOString()).toBe('2026-04-01T00:00:00.000Z')
    })

    test('caps the range and fixes inverted ranges', () => {
        expect(resolveRange('2000-01-01', '2026-03-31', opts, now).from).toBe(
            '2025-04-01'
        )
        expect(resolveRange('2026-03-31', '2026-03-01', opts, now).from).toBe(
            '2026-03-01'
        )
    })

    test('ignores invalid dates', () => {
        const r = resolveRange('garbage', 'nope', opts, now)
        expect(r.to).toBe('2026-03-31')
    })
})

describe('enumerateDays', () => {
    test('is inclusive of both ends', () => {
        expect(enumerateDays('2026-02-27', '2026-03-01')).toEqual([
            '2026-02-27',
            '2026-02-28',
            '2026-03-01',
        ])
    })
})

describe('isHttpUrl', () => {
    test('allows only http(s)', () => {
        expect(isHttpUrl('https://example.com/a?b=c')).toBe(true)
        expect(isHttpUrl('http://example.com')).toBe(true)
        expect(isHttpUrl('javascript:alert(1)')).toBe(false)
        expect(isHttpUrl('data:text/html,<script>1</script>')).toBe(false)
        expect(isHttpUrl('file:///etc/passwd')).toBe(false)
        expect(isHttpUrl('not a url')).toBe(false)
    })
})
