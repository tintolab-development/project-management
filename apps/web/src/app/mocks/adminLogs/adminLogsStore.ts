import { parseAdminLogsListState } from "@/features/admin-logs/lib/adminLogsListParams"
import type { AdminLogsListResponse } from "@/features/admin-logs/model/adminLog"

import { ADMIN_LOGS_SEED } from "./adminLogsSeed"

const normalizeQ = (q: string) => q.trim().toLowerCase()

export const adminLogsStore = {
  listFromSearchParams(searchParams: URLSearchParams): AdminLogsListResponse {
    const state = parseAdminLogsListState(searchParams)
    const pageSize = state.limit
    let rows = structuredClone(ADMIN_LOGS_SEED)
    rows.sort(
      (a, b) =>
        new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime(),
    )

    if (state.project) {
      rows = rows.filter((r) => r.projectId === state.project)
    }

    if (state.affiliation) {
      rows = rows.filter((r) => r.affiliation === state.affiliation)
    }

    const q = normalizeQ(state.q)
    if (q.length > 0) {
      rows = rows.filter((r) => {
        const hay = [
          r.editor,
          r.itemName,
          r.editContent,
          r.category,
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
    }

    const totalCount = rows.length
    const totalPages =
      totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)
    const page =
      totalPages === 0
        ? 1
        : Math.min(Math.max(1, state.page), totalPages)
    const start = (page - 1) * pageSize
    const items = rows.slice(start, start + pageSize)

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  },
}
