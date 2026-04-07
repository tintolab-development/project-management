import { http, HttpResponse } from "msw"

import { apiBasePath } from "@/shared/config/apiBase"
import { uniqueId } from "@/shared/lib/ids"
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

  http.get(url("/items/:itemId/history"), ({ params }) => {
    const itemId = String(params.itemId ?? "")
    const list = mockAppStateStore
      .getSnapshot()
      .history.filter((h) => h.itemId === itemId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    return HttpResponse.json(list)
  }),

  http.get(url("/domains"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot().domains),
  ),

  http.get(url("/project"), () =>
    HttpResponse.json(mockAppStateStore.getSnapshot().project),
  ),

  http.post(url("/task-drafts/comments"), async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid body" }, { status: 400 })
    }
    const rec = body as Record<string, unknown>
    const author = typeof rec.author === "string" ? rec.author.trim() : ""
    const text = typeof rec.body === "string" ? rec.body.trim() : ""
    if (!author || !text) {
      return HttpResponse.json(
        { error: "담당자(author)와 본문(body)이 필요합니다." },
        { status: 400 },
      )
    }
    const createdAt = new Date().toISOString()
    return HttpResponse.json(
      {
        id: uniqueId("DC"),
        author,
        body: text,
        createdAt,
      },
      { status: 201 },
    )
  }),

  http.post(url("/items/:itemId/comments"), async ({ request, params }) => {
    const itemId = String(params.itemId ?? "")
    const snap = mockAppStateStore.getSnapshot()
    const item = snap.items.find((i) => i.id === itemId)
    if (!item) {
      return HttpResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 })
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid body" }, { status: 400 })
    }
    const rec = body as Record<string, unknown>
    const author = typeof rec.author === "string" ? rec.author.trim() : ""
    const text = typeof rec.body === "string" ? rec.body.trim() : ""
    if (!author || !text) {
      return HttpResponse.json(
        { error: "담당자(author)와 본문(body)이 필요합니다." },
        { status: 400 },
      )
    }
    const createdAt = new Date().toISOString()
    const comment = {
      id: uniqueId("C"),
      itemId,
      author,
      body: text,
      createdAt,
    }
    return HttpResponse.json(comment, { status: 201 })
  }),
]
