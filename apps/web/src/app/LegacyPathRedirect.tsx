import { Navigate, useLocation } from "react-router-dom"

import { hasAdminPortalAccess, useAuthSessionStore } from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

const legacyRestSegment = (pathname: string): string => {
  const trimmed = pathname.replace(/^\//, "")
  if (trimmed === "items") return "tasks"
  if (trimmed === "") return "dashboard"
  return trimmed
}

export const LegacyPathRedirect = () => {
  const user = useAuthSessionStore((s) => s.user)
  const { pathname, search } = useLocation()

  if (authBypassed) {
    const rest = legacyRestSegment(pathname)
    return <Navigate to={`/p/seohaewon/${rest}${search}`} replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (hasAdminPortalAccess(user)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const slug =
    user.defaultProjectSlug?.trim() || user.assignedProjects[0]?.slug || null

  if (!slug) {
    return <Navigate to="/no-project-assigned" replace />
  }

  const rest = legacyRestSegment(pathname)
  return <Navigate to={`/p/${slug}/${rest}${search}`} replace />
}
