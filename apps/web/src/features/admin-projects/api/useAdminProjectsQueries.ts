import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

import { adminProjectsQueryKeys } from "../lib/adminProjectsQueryKeys"
import type { AdminProjectsListFilters } from "../lib/adminProjectsListParams"
import type { AdminProject } from "../model/adminProject"
import type { AdminProjectCreateBody } from "../model/adminProjectCreateBodySchema"

import {
  deleteAdminProject,
  fetchAdminProjectsList,
  postAdminProjectCreate,
} from "./adminProjectsApi"

type ListKey = ReturnType<typeof adminProjectsQueryKeys.list>

export function useAdminProjectsQuery(
  filters: AdminProjectsListFilters,
  options?: Omit<
    UseQueryOptions<AdminProject[], Error, AdminProject[], ListKey>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    ...options,
    queryKey: adminProjectsQueryKeys.list(filters),
    queryFn: () => fetchAdminProjectsList(filters),
  })
}

export function useCreateAdminProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdminProjectCreateBody) => postAdminProjectCreate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProjectsQueryKeys.all })
    },
  })
}

export function useDeleteAdminProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => deleteAdminProject(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProjectsQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["admin-schedule"] })
    },
  })
}
