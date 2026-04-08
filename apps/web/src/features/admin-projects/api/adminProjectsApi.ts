import { z } from "zod"

import { httpClient } from "@/shared/api/httpClient"

import { buildAdminProjectsSearchString } from "../lib/adminProjectsListParams"
import type { AdminProjectsListFilters } from "../lib/adminProjectsListParams"
import {
  adminProjectCreateBodySchema,
  type AdminProjectCreateBody,
} from "../model/adminProjectCreateBodySchema"
import { adminProjectSchema, type AdminProject } from "../model/adminProject"

const adminProjectListSchema = z.array(adminProjectSchema)

const deleteAdminProjectResponseSchema = z.object({ ok: z.literal(true) })

export async function fetchAdminProjectsList(
  filters: AdminProjectsListFilters,
): Promise<AdminProject[]> {
  const search = buildAdminProjectsSearchString(filters)
  const { data } = await httpClient.get<unknown>(`admin/projects${search}`)
  return adminProjectListSchema.parse(data)
}

export async function postAdminProjectCreate(
  body: AdminProjectCreateBody,
): Promise<AdminProject> {
  const parsed = adminProjectCreateBodySchema.parse(body)
  const { data } = await httpClient.post<unknown>("admin/projects", parsed)
  return adminProjectSchema.parse(data)
}

export async function deleteAdminProject(projectId: string): Promise<void> {
  const { data } = await httpClient.delete<unknown>(
    `admin/projects/${encodeURIComponent(projectId)}`,
  )
  deleteAdminProjectResponseSchema.parse(data)
}
