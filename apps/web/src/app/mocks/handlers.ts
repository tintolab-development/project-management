import { http, HttpResponse } from "msw"

import {
  buildRelatedTaskSearchRows,
  relatedSearchParamsFromUrl,
} from "@/entities/item/lib/relatedTasksSearchModel"
import { apiBasePath } from "@/shared/config/apiBase"
import { uniqueId } from "@/shared/lib/ids"
import { authHandlers } from "./auth/authHandlers"
import {
  getScopedAdminProjectIds,
  resolveMockUserFromRequest,
} from "./lib/resolveMockUser"
import { PROJECT_PARTICIPANTS_SEED } from "@/shared/lib/projectParticipantsSeed"
import { parseAdminAccountsListState } from "@/features/admin-accounts/lib/adminAccountsListParams"
import { adminAccountMemberSchema } from "@/features/admin-accounts/model/adminAccount"
import {
  adminAccountLoginIdAvailabilityBodySchema,
  adminAccountMemberCreateBodySchema,
} from "@/features/admin-accounts/model/adminAccountMemberCreateBodySchema"
import { adminAffiliationCreateBodySchema } from "@/features/admin-accounts/model/adminAffiliationCreateBodySchema"
import { adminAccountsStore } from "./adminAccounts/adminAccountsStore"
import { adminLogsStore } from "./adminLogs/adminLogsStore"
import { adminProjectCreateBodySchema } from "@/features/admin-projects/model/adminProjectCreateBodySchema"
import type { AdminProject } from "@/features/admin-projects/model/adminProject"
import { adminProjectsStore } from "./adminProjects/adminProjectsStore"
import { adminScheduleStore } from "./adminSchedule/adminScheduleStore"
import { mockAppStateStore } from "./seedStore"

const url = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${apiBasePath}${p}`
}

const sortParticipantsKo = <
  T extends { affiliation: string; name: string; jobTitle: string },
>(
  rows: T[],
): T[] =>
  [...rows].sort((a, b) => {
    const c0 = a.affiliation.localeCompare(b.affiliation, "ko")
    if (c0 !== 0) return c0
    const c1 = a.name.localeCompare(b.name, "ko")
    if (c1 !== 0) return c1
    return a.jobTitle.localeCompare(b.jobTitle, "ko")
  })

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

  http.get(url("/tasks/related-search"), ({ request }) => {
    const snap = mockAppStateStore.getSnapshot()
    const params = relatedSearchParamsFromUrl(request.url)
    const rows = buildRelatedTaskSearchRows(snap.items, snap.domains, params)
    return HttpResponse.json(rows)
  }),

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

  http.get(url("/admin/accounts"), ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    const u = new URL(request.url)
    const state = parseAdminAccountsListState(u.searchParams)
    const body = adminAccountsStore.listGrouped(state, {
      allowedProjectIds: allowedIds,
    })
    return HttpResponse.json(body)
  }),

  http.post(url("/admin/accounts/affiliations"), async ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const parsed = adminAffiliationCreateBodySchema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 })
    }
    const name = parsed.data.name
    const nameTaken = adminProjectsStore
      .getSnapshot()
      .some((p) => p.name.trim() === name)
    if (nameTaken) {
      return HttpResponse.json(
        { error: "이미 같은 이름의 소속이 있습니다." },
        { status: 409 },
      )
    }
    const project = adminProjectsStore.add({
      name,
      description: "",
      status: "in_progress",
      projectType: "internal",
      platformTags: ["기타"],
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      participantNames: [],
    })
    adminAccountsStore.registerEmptyAffiliation(project.id, name)
    return HttpResponse.json({ projectId: project.id, name: project.name })
  }),

  http.post(url("/admin/accounts/login-id/availability"), async ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const parsed = adminAccountLoginIdAvailabilityBodySchema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 })
    }
    const available = !adminAccountsStore.isLoginIdTaken(parsed.data.loginId)
    return HttpResponse.json({ available })
  }),

  http.post(url("/admin/accounts/members"), async ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const parsed = adminAccountMemberCreateBodySchema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 })
    }
    const { projectId, loginId, permission, name, jobTitle, email, phone } = parsed.data
    if (!allowedIds.includes(projectId)) {
      return HttpResponse.json({ error: "접근할 수 없는 소속입니다." }, { status: 403 })
    }
    if (adminAccountsStore.isLoginIdTaken(loginId)) {
      return HttpResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 })
    }
    const project = adminProjectsStore.getSnapshot().find((p) => p.id === projectId)
    const affiliation = project?.name ?? projectId
    const emailNorm = email?.trim() ?? ""
    const phoneNorm = phone?.trim() ?? ""
    const member = adminAccountsStore.addMember({
      projectId,
      affiliation,
      loginId,
      permission,
      name,
      jobTitle,
      email: emailNorm,
      phone: phoneNorm,
    })
    return HttpResponse.json(adminAccountMemberSchema.parse(member))
  }),

  http.delete(url("/admin/accounts/members/:memberId"), ({ params, request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    const memberId = String(params.memberId ?? "")
    const member = adminAccountsStore
      .getSnapshot()
      .find((m) => m.id === memberId)
    if (!member) {
      return HttpResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 })
    }
    if (!allowedIds.includes(member.projectId)) {
      return HttpResponse.json(
        { error: "접근할 수 없는 계정입니다." },
        { status: 403 },
      )
    }
    const ok = adminAccountsStore.removeMember(memberId)
    if (!ok) {
      return HttpResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 })
    }
    return HttpResponse.json({ ok: true })
  }),

  http.get(url("/admin/schedule/events"), ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const u = new URL(request.url)
    const from = u.searchParams.get("from")?.trim() ?? ""
    const to = u.searchParams.get("to")?.trim() ?? ""
    if (!from || !to) {
      return HttpResponse.json(
        { error: "from, to 파라미터가 필요합니다." },
        { status: 400 },
      )
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    const list = adminScheduleStore.listInRange(from, to, allowedIds)
    return HttpResponse.json(list)
  }),

  http.get(url("/admin/projects"), ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    const u = new URL(request.url)
    const q = u.searchParams.get("q")?.trim() ?? ""
    const type = u.searchParams.get("type")?.trim() ?? ""
    const status = u.searchParams.get("status")?.trim() ?? ""
    const from = u.searchParams.get("from")?.trim() ?? ""
    const to = u.searchParams.get("to")?.trim() ?? ""
    const list = adminProjectsStore.list({ q, type, status, from, to })
    const filtered = list.filter((p) => allowedIds.includes(p.id))
    return HttpResponse.json(filtered)
  }),

  http.post(url("/admin/projects"), async ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const parsed = adminProjectCreateBodySchema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 })
    }
    const b = parsed.data
    const row: Omit<AdminProject, "id"> = {
      name: b.name,
      description: b.description,
      status: b.status ?? "upcoming",
      projectType: b.projectType,
      platformTags: b.platformTags,
      startDate: b.startDate,
      endDate: b.endDate,
      participantNames: b.participantNames,
    }
    const created = adminProjectsStore.add(row)
    return HttpResponse.json(created)
  }),

  http.get(url("/admin/logs"), ({ request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    if (!mockUser.roles.includes("tintolab_master_admin")) {
      return HttpResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }
    const u = new URL(request.url)
    const body = adminLogsStore.listFromSearchParams(u.searchParams)
    return HttpResponse.json(body)
  }),

  http.delete(url("/admin/projects/:projectId"), ({ params, request }) => {
    const mockUser = resolveMockUserFromRequest(request)
    if (!mockUser) {
      return HttpResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }
    const allowedIds = getScopedAdminProjectIds(mockUser)
    const projectId = String(params.projectId ?? "")
    if (!allowedIds.includes(projectId)) {
      return HttpResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 })
    }
    const ok = adminProjectsStore.remove(projectId)
    if (!ok) {
      return HttpResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 })
    }
    adminAccountsStore.removeAffiliation(projectId)
    return HttpResponse.json({ ok: true })
  }),

  http.get(url("/projects/:projectSlug/participants"), ({ request }) => {
    const u = new URL(request.url)
    const affiliation = u.searchParams.get("affiliation")?.trim() ?? ""
    const name = u.searchParams.get("name")?.trim() ?? ""

    let list = structuredClone(PROJECT_PARTICIPANTS_SEED)
    if (affiliation.length > 0) {
      list = list.filter((p) => p.affiliation === affiliation)
    }
    if (name.length > 0) {
      list = list.filter((p) => p.name.includes(name))
    }
    list = sortParticipantsKo(list)
    return HttpResponse.json(list)
  }),

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
