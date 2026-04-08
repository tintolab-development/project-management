import type { AdminLogsListState } from "./adminLogsListParams"

export const adminLogsQueryKeys = {
  all: ["admin-logs"] as const,
  list: (state: AdminLogsListState) =>
    [...adminLogsQueryKeys.all, "list", state] as const,
}
