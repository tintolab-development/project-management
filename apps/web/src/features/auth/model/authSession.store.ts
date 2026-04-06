import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type AssignedProject = {
  id: string
  name: string
}

export type AuthUser = {
  id: string
  email: string
  displayName: string
  /** 회사·팀 등 표시용 소속 (구버전 세션에는 없을 수 있음) */
  organization?: string
  assignedProjects: AssignedProject[]
}

type AuthSessionState = {
  accessToken: string | null
  user: AuthUser | null
  setSession: (payload: { accessToken: string; user: AuthUser } | null) => void
}

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
              user: payload.user,
            }),
    }),
    {
      name: "tdw-auth-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
      }),
    },
  ),
)
