import { z } from "zod"

import { httpClient } from "@/shared/api/httpClient"

import {
  buildAdminAccountsSearchString,
  type AdminAccountsListState,
} from "../lib/adminAccountsListParams"
import {
  adminAccountMemberSchema,
  adminAccountsGroupedResponseSchema,
  type AdminAccountMember,
  type AdminAccountsGroupedResponse,
} from "../model/adminAccount"
import {
  adminAccountLoginIdAvailabilityResponseSchema,
  type AdminAccountLoginIdAvailabilityBody,
  type AdminAccountMemberCreateBody,
} from "../model/adminAccountMemberCreateBodySchema"
import type { AdminAffiliationCreateBody } from "../model/adminAffiliationCreateBodySchema"

const adminAffiliationCreateResponseSchema = z.object({
  projectId: z.string(),
  name: z.string(),
})

export type AdminAffiliationCreateResponse = z.infer<
  typeof adminAffiliationCreateResponseSchema
>

export async function postAdminAffiliationCreate(
  body: AdminAffiliationCreateBody,
): Promise<AdminAffiliationCreateResponse> {
  const { data } = await httpClient.post<unknown>(
    "admin/accounts/affiliations",
    body,
  )
  return adminAffiliationCreateResponseSchema.parse(data)
}

export async function fetchAdminAccountsGrouped(
  state: AdminAccountsListState,
): Promise<AdminAccountsGroupedResponse> {
  const search = buildAdminAccountsSearchString(state)
  const { data } = await httpClient.get<unknown>(
    `admin/accounts${search}`,
  )
  return adminAccountsGroupedResponseSchema.parse(data)
}

export async function postAdminAccountLoginIdAvailability(
  body: AdminAccountLoginIdAvailabilityBody,
) {
  const { data } = await httpClient.post<unknown>(
    "admin/accounts/login-id/availability",
    body,
  )
  return adminAccountLoginIdAvailabilityResponseSchema.parse(data)
}

export async function postAdminAccountMemberCreate(
  body: AdminAccountMemberCreateBody,
): Promise<AdminAccountMember> {
  const { data } = await httpClient.post<unknown>("admin/accounts/members", body)
  return adminAccountMemberSchema.parse(data)
}

export async function deleteAdminAccountMember(memberId: string): Promise<void> {
  await httpClient.delete(
    `admin/accounts/members/${encodeURIComponent(memberId)}`,
  )
}
