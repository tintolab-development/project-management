import { apiUrl } from "@/shared/config/apiBase"

import { normalizeAuthUser } from "../lib/normalizeAuthUser"
import type { AuthUser } from "../model/authSession.store"
import type { MemberProfileFormValues } from "../model/memberProfileFormSchema"

export type MemberProfileDto = {
  displayName: string
  loginId: string
  phone: string
  email: string
}

async function readErrorMessage(res: Response): Promise<string> {
  const data: unknown = await res.json().catch(() => ({}))
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error
    if (typeof err === "string") return err
  }
  return "요청에 실패했습니다."
}

export async function fetchMemberProfile(
  accessToken: string,
): Promise<MemberProfileDto> {
  const res = await fetch(apiUrl("/auth/profile"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as MemberProfileDto
}

export async function patchMemberProfile(
  accessToken: string,
  body: MemberProfileFormValues,
): Promise<AuthUser> {
  const res = await fetch(apiUrl("/auth/profile"), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  const data = (await res.json()) as { user: unknown }
  return normalizeAuthUser(data.user as Record<string, unknown>)
}
