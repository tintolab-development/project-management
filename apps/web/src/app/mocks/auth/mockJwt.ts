import { base64UrlDecode, base64UrlEncode } from "./base64Url"

const MOCK_SIGNATURE = "mock-dev-signature"

export function createMockAccessToken(userId: string, email: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "none", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: userId,
      email,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    }),
  )
  return `${header}.${payload}.${MOCK_SIGNATURE}`
}

export function parseMockAccessToken(
  token: string,
): { sub: string; email: string } | null {
  const parts = token.split(".")
  if (parts.length !== 3 || parts[2] !== MOCK_SIGNATURE) return null
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as {
      sub?: unknown
      email?: unknown
      exp?: unknown
    }
    if (typeof payload.exp !== "number") return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (typeof payload.sub !== "string" || typeof payload.email !== "string")
      return null
    return { sub: payload.sub, email: payload.email }
  } catch {
    return null
  }
}
