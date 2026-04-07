import { useAppStore } from "@/app/store/useAppStore"

import { apiPut } from "./httpClient"

/** MSW 등 목 백엔드의 `PUT /app-state`와 동기화합니다. */
export async function putAppStateSnapshot(body: unknown): Promise<unknown> {
  return apiPut("/app-state", body)
}

/** Zustand 스냅샷을 목 서버(`mockAppStateStore`)에 반영합니다. */
export async function syncMockAppStateFromStore(): Promise<unknown> {
  const json = useAppStore.getState().exportStateJson()
  return putAppStateSnapshot(JSON.parse(json) as object)
}
