import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { adminScheduleQueryKeys } from "../lib/adminScheduleQueryKeys"
import type { AdminScheduleEvent } from "../model/adminScheduleEvent"

import { fetchAdminScheduleEvents } from "./adminScheduleApi"

type RangeKey = ReturnType<typeof adminScheduleQueryKeys.range>

export function useAdminScheduleQuery(
  range: { from: string; to: string },
  options?: Omit<
    UseQueryOptions<
      AdminScheduleEvent[],
      Error,
      AdminScheduleEvent[],
      RangeKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    ...options,
    queryKey: adminScheduleQueryKeys.range(range.from, range.to),
    queryFn: () => fetchAdminScheduleEvents(range),
  })
}
