import { apiPut } from "./httpClient"

/** MSW 등 목 백엔드의 `PUT /app-state`와 동기화합니다. */
export async function putAppStateSnapshot(body: unknown): Promise<unknown> {
  return apiPut("/app-state", body)
}
