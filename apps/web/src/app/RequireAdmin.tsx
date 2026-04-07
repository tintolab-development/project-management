import { Navigate, Outlet } from "react-router-dom"

import {
  hasAdminPortalAccess,
  resolvePostLoginPath,
  useAuthSessionStore,
} from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

export const RequireAdmin = () => {
  const user = useAuthSessionStore((s) => s.user)

  if (authBypassed) {
    return <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasAdminPortalAccess(user)) {
    return <Navigate to={resolvePostLoginPath(user)} replace />
  }

  return <Outlet />
}
