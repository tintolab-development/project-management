export type AdminLogsListState = {
  project: string
  q: string
  affiliation: string
  page: number
  limit: number
}

export const DEFAULT_ADMIN_LOGS_LIMIT = 20

export const EMPTY_ADMIN_LOGS_FILTERS = {
  project: "",
  q: "",
  affiliation: "",
} as const

export const parseAdminLogsListState = (
  searchParams: URLSearchParams,
): AdminLogsListState => {
  const pageRaw = searchParams.get("page")
  const pageParsed = parseInt(pageRaw ?? "1", 10)
  const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1

  const limitRaw = searchParams.get("limit")
  const limitParsed = parseInt(
    limitRaw ?? String(DEFAULT_ADMIN_LOGS_LIMIT),
    10,
  )
  const limit = Math.min(
    100,
    Math.max(1, Number.isFinite(limitParsed) ? limitParsed : DEFAULT_ADMIN_LOGS_LIMIT),
  )

  return {
    project: searchParams.get("project")?.trim() ?? "",
    q: searchParams.get("q")?.trim() ?? "",
    affiliation: searchParams.get("affiliation")?.trim() ?? "",
    page,
    limit,
  }
}

export const mergeAdminLogsFiltersIntoParams = (
  prev: URLSearchParams,
  filters: {
    project: string
    q: string
    affiliation: string
  },
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  const entries: [string, string][] = [
    ["project", filters.project.trim()],
    ["q", filters.q.trim()],
    ["affiliation", filters.affiliation.trim()],
  ]
  for (const [key, v] of entries) {
    if (v) next.set(key, v)
    else next.delete(key)
  }
  next.delete("page")
  return next
}

export const mergeAdminLogsPageIntoParams = (
  prev: URLSearchParams,
  page: number,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  if (page <= 1) next.delete("page")
  else next.set("page", String(page))
  return next
}
