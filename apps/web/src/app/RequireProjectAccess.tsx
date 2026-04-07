import { Navigate, Outlet, useParams } from "react-router-dom"

import {
  canAccessProjectSlug,
  resolvePostLoginPath,
  useAuthSessionStore,
} from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

export const RequireProjectAccess = () => {
  const { projectSlug = "" } = useParams()
  const user = useAuthSessionStore((s) => s.user)

  if (authBypassed) {
    return <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessProjectSlug(user, projectSlug)) {
    return <Navigate to={resolvePostLoginPath(user)} replace />
  }

  return <Outlet />
}
