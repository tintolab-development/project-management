import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"

import { httpClient } from "./httpClient"

/** `baseURL`(예: `/api`) 기준 상대 경로. 앞뒤 슬래시는 정규화합니다. */
export function normalizeApiPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "")
}

export function restResourceQueryKeys(queryKeyRoot: readonly [string, ...readonly unknown[]]) {
  return {
    all: queryKeyRoot,
    lists: () => [...queryKeyRoot, "list"] as const,
    list: (params: unknown) => [...queryKeyRoot, "list", params] as const,
    details: () => [...queryKeyRoot, "detail"] as const,
    detail: (id: string) => [...queryKeyRoot, "detail", id] as const,
  }
}

export type CreateRestCrudHooksConfig<TItem> = {
  /** 예: `projects`, `v1/workspaces` */
  resourcePath: string
  /** 도메인별 안정적인 쿼리 키 루트. 첫 요소는 보통 리소스 이름 문자열. */
  queryKeyRoot: readonly [string, ...readonly unknown[]]
  updateMethod?: "patch" | "put"
  /** 목록 쿼리 파라미터를 쿼리스트링으로 보낼지 여부 (기본 true) */
  sendListParamsAsSearchParams?: boolean
  getItemId?: (item: TItem) => string
}

export function createRestCrudHooks<
  TItem,
  TCreate = TItem,
  TUpdate = Partial<TItem>,
  TListParams extends Record<string, unknown> | undefined = undefined,
>(config: CreateRestCrudHooksConfig<TItem>) {
  const {
    resourcePath,
    queryKeyRoot,
    updateMethod = "patch",
    sendListParamsAsSearchParams = true,
    getItemId = (item: TItem) => String((item as { id: unknown }).id),
  } = config

  const root = normalizeApiPath(resourcePath)
  const listUrl = root
  const detailUrl = (id: string) => `${root}/${encodeURIComponent(id)}`

  const keys = restResourceQueryKeys(queryKeyRoot)

  type ListKey = ReturnType<typeof keys.list>
  type DetailKey = ReturnType<typeof keys.detail>

  function useListQuery(
    options?: {
      listParams?: TListParams
    } & Omit<
      UseQueryOptions<TItem[], Error, TItem[], ListKey>,
      "queryKey" | "queryFn"
    >,
  ) {
    const { listParams, ...queryOptions } = options ?? {}
    const paramsKey = (listParams ?? {}) as Record<string, unknown>

    return useQuery({
      ...queryOptions,
      queryKey: keys.list(paramsKey),
      queryFn: async () => {
        const { data } = await httpClient.get<TItem[]>(listUrl, {
          ...(sendListParamsAsSearchParams && listParams
            ? { params: listParams as Record<string, unknown> }
            : {}),
        })
        return data
      },
    })
  }

  function useItemQuery(
    id: string | undefined,
    options?: Omit<
      UseQueryOptions<TItem, Error, TItem, DetailKey>,
      "queryKey" | "queryFn"
    >,
  ) {
    return useQuery({
      ...options,
      queryKey: keys.detail(id ?? ""),
      queryFn: async () => {
        const { data } = await httpClient.get<TItem>(detailUrl(id!))
        return data
      },
      enabled: (options?.enabled ?? true) && Boolean(id),
    })
  }

  function useCreateMutation(
    options?: Omit<
      UseMutationOptions<TItem, Error, TCreate, unknown>,
      "mutationFn"
    >,
  ) {
    const queryClient = useQueryClient()
    const { onSuccess: userOnSuccess, ...rest } = options ?? {}

    return useMutation({
      ...rest,
      mutationFn: async (body: TCreate) => {
        const { data } = await httpClient.post<TItem>(listUrl, body)
        return data
      },
      onSuccess: async (data, variables, onMutateResult, context) => {
        await queryClient.invalidateQueries({ queryKey: keys.lists() })
        await userOnSuccess?.(data, variables, onMutateResult, context)
      },
    })
  }

  function useUpdateMutation(
    options?: Omit<
      UseMutationOptions<TItem, Error, { id: string; body: TUpdate }, unknown>,
      "mutationFn"
    >,
  ) {
    const queryClient = useQueryClient()
    const { onSuccess: userOnSuccess, ...rest } = options ?? {}

    return useMutation({
      ...rest,
      mutationFn: async ({ id, body }) => {
        const { data } =
          updateMethod === "put"
            ? await httpClient.put<TItem>(detailUrl(id), body)
            : await httpClient.patch<TItem>(detailUrl(id), body)
        return data
      },
      onSuccess: async (data, variables, onMutateResult, context) => {
        await queryClient.invalidateQueries({ queryKey: keys.lists() })
        await queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) })
        await userOnSuccess?.(data, variables, onMutateResult, context)
      },
    })
  }

  function useDeleteMutation(
    options?: Omit<UseMutationOptions<void, Error, string, unknown>, "mutationFn">,
  ) {
    const queryClient = useQueryClient()
    const { onSuccess: userOnSuccess, ...rest } = options ?? {}

    return useMutation({
      ...rest,
      mutationFn: async (id: string) => {
        await httpClient.delete(detailUrl(id))
      },
      onSuccess: async (data, id, onMutateResult, context) => {
        await queryClient.invalidateQueries({ queryKey: keys.lists() })
        queryClient.removeQueries({ queryKey: keys.detail(id) })
        await userOnSuccess?.(data, id, onMutateResult, context)
      },
    })
  }

  return {
    queryKeys: keys,
    listUrl,
    detailUrl,
    getItemId,
    useListQuery,
    useItemQuery,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
  }
}

export type RestCrudHooks<
  TItem,
  TCreate = TItem,
  TUpdate = Partial<TItem>,
  TListParams extends Record<string, unknown> | undefined = undefined,
> = ReturnType<typeof createRestCrudHooks<TItem, TCreate, TUpdate, TListParams>>
