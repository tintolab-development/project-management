import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { adminLogsQueryKeys } from "../lib/adminLogsQueryKeys"
import type { AdminLogsListState } from "../lib/adminLogsListParams"
import type { AdminLogsListResponse } from "../model/adminLog"
import { fetchAdminLogsList } from "./adminLogsApi"

type ListKey = ReturnType<typeof adminLogsQueryKeys.list>

export function useAdminLogsQuery(
  state: AdminLogsListState,
  options?: Omit<
    UseQueryOptions<
      AdminLogsListResponse,
      Error,
      AdminLogsListResponse,
      ListKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    ...options,
    queryKey: adminLogsQueryKeys.list(state),
    queryFn: () => fetchAdminLogsList(state),
  })
}
