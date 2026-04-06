import { http, HttpResponse } from "msw"

import { apiBasePath } from "@/shared/config/apiBase"
import { createMockAccessToken, parseMockAccessToken } from "./mockJwt"
import { mockUsersStore } from "./mockUsersStore"

const url = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${apiBasePath}${p}`
}

const unauthorized = () =>
  HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })

function userPayload(u: {
  id: string
  email: string
  displayName: string
  organization: string
  assignedProjects: { id: string; name: string }[]
}) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    organization: u.organization,
    assignedProjects: u.assignedProjects,
  }
}

export const authHandlers = [
  http.post(url("/auth/login"), async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const row = body as { email?: unknown; password?: unknown }
    const email = typeof row.email === "string" ? row.email : ""
    const password = typeof row.password === "string" ? row.password : ""

    const user = mockUsersStore.verifyCredentials(email, password)
    if (!user) {
      return HttpResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      )
    }

    const accessToken = createMockAccessToken(user.id, user.email)
    return HttpResponse.json({
      accessToken,
      user: userPayload(user),
    })
  }),

  http.get(url("/auth/me"), ({ request }) => {
    const auth = request.headers.get("Authorization")
    const token =
      auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : ""
    if (!token) return unauthorized()

    const parsed = parseMockAccessToken(token)
    if (!parsed) return unauthorized()

    const user = mockUsersStore.findById(parsed.sub)
    if (!user) return unauthorized()

    return HttpResponse.json(userPayload(user))
  }),

  http.post(url("/auth/logout"), () => new HttpResponse(null, { status: 204 })),
]
