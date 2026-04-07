import { apiUrl } from "@/shared/config/apiBase"

import type { AuthUser } from "../model/authSession.store"

export type AuthSuccessResponse = {
  accessToken: string
  user: AuthUser
}

async function readErrorMessage(res: Response): Promise<string> {
  const data: unknown = await res.json().catch(() => ({}))
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error
    if (typeof err === "string") return err
  }
  return "요청에 실패했습니다."
}

export async function loginRequest(input: {
  email: string
  password: string
}): Promise<AuthSuccessResponse> {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as AuthSuccessResponse
}

export async function meRequest(accessToken: string): Promise<AuthUser> {
  const res = await fetch(apiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as AuthUser
}

export async function logoutRequest(): Promise<void> {
  await fetch(apiUrl("/auth/logout"), { method: "POST" })
}
