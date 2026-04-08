import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

import { adminAccountsQueryKeys } from "../lib/adminAccountsQueryKeys"
import type { AdminAccountsListState } from "../lib/adminAccountsListParams"
import type { AdminAccountsGroupedResponse } from "../model/adminAccount"
import {
  deleteAdminAccountMember,
  fetchAdminAccountsGrouped,
} from "./adminAccountsApi"

type GroupedKey = ReturnType<typeof adminAccountsQueryKeys.grouped>

/**
 * 테이블별 페이지(`groupPages`)만 바뀔 때만 이전 응답을 유지해 목록이 통째로 사라지지 않게 함(스크롤 점프 완화).
 * 검색·필터(q, project, limit)가 바뀌면 이전 목록을 보여주지 않음.
 */
const groupedPlaceholderData = (
  nextState: AdminAccountsListState,
  previousData: AdminAccountsGroupedResponse | undefined,
  previousQuery: { queryKey: GroupedKey } | undefined,
): AdminAccountsGroupedResponse | undefined => {
  if (!previousData || !previousQuery) return undefined
  const prevKey = previousQuery.queryKey
  const prevState = prevKey[2]
  if (
    prevState.q !== nextState.q ||
    prevState.project !== nextState.project ||
    prevState.limit !== nextState.limit
  ) {
    return undefined
  }
  return previousData
}

export function useAdminAccountsGroupedQuery(
  state: AdminAccountsListState,
  options?: Omit<
    UseQueryOptions<
      AdminAccountsGroupedResponse,
      Error,
      AdminAccountsGroupedResponse,
      GroupedKey
    >,
    "queryKey" | "queryFn" | "placeholderData"
  >,
) {
  return useQuery({
    ...options,
    queryKey: adminAccountsQueryKeys.grouped(state),
    queryFn: () => fetchAdminAccountsGrouped(state),
    placeholderData: (previousData, previousQuery) =>
      groupedPlaceholderData(state, previousData, previousQuery),
  })
}

export function useDeleteAdminAccountMemberMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => deleteAdminAccountMember(memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.all })
    },
  })
}
