import { http, HttpResponse } from "msw"

import { apiBasePath } from "@/shared/config/apiBase"
import { authHandlers } from "./auth/authHandlers"
import { mockAppStateStore } from "./seedStore"

const url = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${apiBasePath}${p}`
}

export const handlers = [
  ...authHandlers,

  http.get(url("/health"), () =>
    HttpResponse.json({ status: "ok", mock: true }),
  ),

  http.get(url("/app-state"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot()),
  ),

  http.put(url("/app-state"), async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const next = mockAppStateStore.replaceFromRaw(body)
    return HttpResponse.json(next)
  }),

  http.post(url("/app-state/reset"), () =>
    HttpResponse.json(mockAppStateStore.reset()),
  ),

  http.get(url("/items"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot().items),
  ),

  http.get(url("/domains"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot().domains),
  ),

  http.get(url("/project"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot().project),
  ),
]
