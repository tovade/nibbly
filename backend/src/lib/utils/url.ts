/** True only for absolute http(s) URLs, never javascript:, data:, file: etc. */
export function isHttpUrl(value: string): boolean {
    try {
        const { protocol } = new URL(value)
        return protocol === 'http:' || protocol === 'https:'
    } catch {
        return false
    }
}
