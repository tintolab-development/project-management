const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
const trimmed = (raw ?? "/api").replace(/\/$/, "")

/** Same-origin API path prefix for fetch and MSW handlers (e.g. `/api`). */
export const apiBasePath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${apiBasePath}${p}`
}
