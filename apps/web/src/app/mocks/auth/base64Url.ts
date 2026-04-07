export function base64UrlEncode(input: string): string {
  const base64 = btoa(unescape(encodeURIComponent(input)))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) base64 += "="
  return decodeURIComponent(escape(atob(base64)))
}
