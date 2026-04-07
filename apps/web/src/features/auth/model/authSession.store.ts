import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { normalizeAuthUser } from "../lib/normalizeAuthUser"
import type { AuthRole } from "../lib/authRoles"

export type AssignedProject = {
  id: string
  name: string
  /** URL 경로 `/p/:projectSlug` 에 사용 */
  slug: string
}

export type AuthUser = {
  id: string
  email: string
  displayName: string
  /** 회사·팀 등 표시용 소속 (구버전 세션에는 없을 수 있음) */
  organization?: string
  roles: AuthRole[]
  assignedProjects: AssignedProject[]
  /** API·가드용 접근 가능 프로젝트 id 목록 */
  accessibleProjectIds: string[]
  /** 담당자 계정 기본 진입 프로젝트 (없으면 단일 할당 또는 선택 화면 규칙 적용) */
  defaultProjectSlug: string | null
}

type AuthSessionState = {
  accessToken: string | null
  user: AuthUser | null
  setSession: (payload: { accessToken: string; user: AuthUser } | null) => void
}

type PersistedAuthSlice = Pick<AuthSessionState, "accessToken" | "user">

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (payload) =>
        payload === null
          ? set({ accessToken: null, user: null })
          : set({
              accessToken: payload.accessToken,
              user: normalizeAuthUser(payload.user),
            }),
    }),
    {
      name: "tdw-auth-session",
      version: 1,
      migrate: (persisted, fromVersion): PersistedAuthSlice => {
        const p = (persisted ?? {}) as Partial<PersistedAuthSlice>
        if (fromVersion === 0 && p.user) {
          return {
            accessToken: p.accessToken ?? null,
            user: normalizeAuthUser(p.user as Record<string, unknown>),
          }
        }
        return {
          accessToken: p.accessToken ?? null,
          user: p.user ? normalizeAuthUser(p.user as Record<string, unknown>) : null,
        }
      },
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
      }),
    },
  ),
)
