import type { AdminProjectsListFilters } from "./adminProjectsListParams"

export const adminProjectsQueryKeys = {
  all: ["admin-projects"] as const,
  list: (filters: AdminProjectsListFilters) =>
    [...adminProjectsQueryKeys.all, "list", filters] as const,
}
