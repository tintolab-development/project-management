import { httpClient } from "@/shared/api/httpClient"

import type { AdminLogsListState } from "../lib/adminLogsListParams"
import {
  adminLogsListResponseSchema,
  type AdminLogsListResponse,
} from "../model/adminLog"

const buildSearchString = (state: AdminLogsListState): string => {
  const params = new URLSearchParams()
  if (state.project) params.set("project", state.project)
  if (state.q) params.set("q", state.q)
  if (state.affiliation) params.set("affiliation", state.affiliation)
  if (state.page > 1) params.set("page", String(state.page))
  params.set("limit", String(state.limit))
  return `?${params.toString()}`
}

export async function fetchAdminLogsList(
  state: AdminLogsListState,
): Promise<AdminLogsListResponse> {
  const search = buildSearchString(state)
  const { data } = await httpClient.get<unknown>(`admin/logs${search}`)
  return adminLogsListResponseSchema.parse(data)
}
