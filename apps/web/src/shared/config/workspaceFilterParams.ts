const FILTER_KEYS = ["type", "domain", "priority", "owner"] as const

export type WorkspaceFilterSelections = {
  types: string[]
  domains: string[]
  priorities: string[]
  owners: string[]
}

export function hasWorkspaceFiltersActive(s: WorkspaceFilterSelections): boolean {
  return (
    s.types.length > 0 ||
    s.domains.length > 0 ||
    s.priorities.length > 0 ||
    s.owners.length > 0
  )
}

export function readWorkspaceFilterSelections(
  searchParams: URLSearchParams,
): WorkspaceFilterSelections {
  return {
    types: searchParams.getAll("type"),
    domains: searchParams.getAll("domain"),
    priorities: searchParams.getAll("priority"),
    owners: searchParams.getAll("owner"),
  }
}

/**
 * Preserves all params (e.g. `workspace`), replaces only filter keys with the given selections.
 */
export function mergeWorkspaceFiltersIntoParams(
  prev: URLSearchParams,
  filters: WorkspaceFilterSelections,
): URLSearchParams {
  const next = new URLSearchParams(prev)
  for (const key of FILTER_KEYS) {
    next.delete(key)
  }
  for (const v of filters.types) {
    if (v) next.append("type", v)
  }
  for (const v of filters.domains) {
    if (v) next.append("domain", v)
  }
  for (const v of filters.priorities) {
    if (v) next.append("priority", v)
  }
  for (const v of filters.owners) {
    if (v) next.append("owner", v)
  }
  return next
}

export function filterItemsByWorkspaceSelections<T extends {
  type: string
  domain: string
  priority: string
  owner: string
}>(
  items: T[],
  activeWorkspaceTab: "information_request" | "decision",
  selections: WorkspaceFilterSelections,
): T[] {
  let out = items

  if (selections.types.length > 0) {
    const set = new Set(selections.types)
    out = out.filter((i) => set.has(i.type))
  } else {
    out = out.filter((i) => i.type === activeWorkspaceTab)
  }

  if (selections.domains.length > 0) {
    const set = new Set(selections.domains)
    out = out.filter((i) => set.has(i.domain))
  }

  if (selections.priorities.length > 0) {
    const set = new Set(selections.priorities)
    out = out.filter((i) => set.has(i.priority))
  }

  if (selections.owners.length > 0) {
    const set = new Set(selections.owners)
    out = out.filter((i) => set.has(i.owner))
  }

  return out
}
