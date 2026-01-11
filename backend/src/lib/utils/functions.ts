import { randomInt } from 'crypto'
import type { DataResponse, ErrorResponse } from '../types'

export function generateRandomString(length: number): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        const index = randomInt(chars.length)
        result += chars.charAt(index)
    }
    return result
}

export function isError(
    resp: ErrorResponse | DataResponse
): resp is ErrorResponse {
    return (resp as ErrorResponse).errors !== undefined
}
