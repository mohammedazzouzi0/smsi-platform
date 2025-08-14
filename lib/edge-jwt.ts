// Edge-compatible JWT HS256 verification using Web Crypto API

export interface EdgeJWTPayload {
  userId: number
  email: string
  role: "user" | "admin"
  iat?: number
  exp?: number
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/").padEnd(((base64Url.length + 3) >> 2) << 2, "=")
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary")
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function utf8Encode(input: string): Uint8Array {
  return new TextEncoder().encode(input)
}

export async function verifyJwtHS256(token: string, secret: string): Promise<EdgeJWTPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const headerJson = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedHeader)))
    if (headerJson.alg !== "HS256") return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedPayload))) as EdgeJWTPayload

    // Verify signature
    const key = await crypto.subtle.importKey(
      "raw",
      utf8Encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const data = utf8Encode(`${encodedHeader}.${encodedPayload}`)
    const signature = base64UrlToUint8Array(encodedSignature)
    const isValid = await crypto.subtle.verify("HMAC", key, signature, data)
    if (!isValid) return null

    // Check expiration (if present)
    if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) return null

    return payload
  } catch {
    return null
  }
}


