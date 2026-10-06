import { ANALYTICS_CONFIG } from '../../config/analytics.config'

type RequestWithIp = Request & {
    ip?: string
    runtime?: { node?: { req?: { socket?: { remoteAddress?: string } } } }
}

type ServerLike = { requestIP?: (req: Request) => { address: string } | null }

function stripMappedPrefix(ip: string): string {
    return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

/**
 * Resolves the client IP. The @elysiajs/node adapter's server.requestIP() throws,
 * so we read the srvx request (`request.ip`) and fall back to the raw socket, then Bun.
 * Proxy headers are only honoured when TRUST_PROXY=true, otherwise they are spoofable
 * and would let anyone inflate unique counts.
 */
export function getClientIp(
    request: Request,
    server?: ServerLike | null
): string | null {
    if (ANALYTICS_CONFIG.trustProxy) {
        const forwarded =
            request.headers.get('cf-connecting-ip') ??
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip')
        if (forwarded) return stripMappedPrefix(forwarded)
    }

    const req = request as RequestWithIp
    const direct = req.ip ?? req.runtime?.node?.req?.socket?.remoteAddress
    if (direct) return stripMappedPrefix(direct)

    try {
        const address = server?.requestIP?.(request)?.address
        if (address) return stripMappedPrefix(address)
    } catch {
        // adapter doesn't support requestIP
    }

    return null
}
