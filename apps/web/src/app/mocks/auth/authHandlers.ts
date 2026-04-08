import { http, HttpResponse } from "msw"

import { apiBasePath } from "@/shared/config/apiBase"
import { resolveMockUserFromRequest } from "../lib/resolveMockUser"
import { createMockAccessToken } from "./mockJwt"
import type { MockUserRecord } from "./mockUsersStore"
import { mockUsersStore } from "./mockUsersStore"

const url = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${apiBasePath}${p}`
}

const unauthorized = () =>
  HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })

function userPayload(u: MockUserRecord) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    loginId: u.loginId,
    phone: u.phone,
    organization: u.organization,
    roles: u.roles,
    assignedProjects: u.assignedProjects,
    accessibleProjectIds: u.accessibleProjectIds,
    defaultProjectSlug: u.defaultProjectSlug,
  }
}

function profileResponse(u: MockUserRecord) {
  return {
    displayName: u.displayName,
    loginId: u.loginId,
    phone: u.phone,
    email: u.email,
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
    const user = resolveMockUserFromRequest(request)
    if (!user) return unauthorized()
    return HttpResponse.json(userPayload(user))
  }),

  http.get(url("/auth/profile"), ({ request }) => {
    const user = resolveMockUserFromRequest(request)
    if (!user) return unauthorized()
    return HttpResponse.json(profileResponse(user))
  }),

  http.patch(url("/auth/profile"), async ({ request }) => {
    const user = resolveMockUserFromRequest(request)
    if (!user) return unauthorized()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const row = body as {
      displayName?: unknown
      loginId?: unknown
      phone?: unknown
      email?: unknown
      password?: unknown
    }
    const displayName =
      typeof row.displayName === "string" ? row.displayName : ""
    const loginId = typeof row.loginId === "string" ? row.loginId : ""
    const phone = typeof row.phone === "string" ? row.phone : ""
    const email = typeof row.email === "string" ? row.email : ""
    const password = typeof row.password === "string" ? row.password : ""

    const result = mockUsersStore.updateProfile(user.id, {
      displayName,
      loginId,
      phone,
      email,
      password,
    })
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status })
    }

    return HttpResponse.json({
      user: userPayload(result.user),
    })
  }),

  http.post(url("/auth/logout"), () => new HttpResponse(null, { status: 204 })),
]
