import { Navigate, Outlet } from "react-router-dom"

import { useAuthSessionStore } from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

export const RequireAuth = () => {
  const accessToken = useAuthSessionStore((s) => s.accessToken)

  if (authBypassed) {
    return <Outlet />
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
