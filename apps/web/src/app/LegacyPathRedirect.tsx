import { Navigate, useLocation } from "react-router-dom"

import { hasAdminPortalAccess, useAuthSessionStore } from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

/** 구 `/p/:slug/...` 주소를 `/project/:slug/...` 로 옮깁니다. */
export const LegacyPPathPrefixRedirect = () => {
  const { pathname, search } = useLocation()
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] !== "p" || !segments[1]) {
    return <Navigate to="/" replace />
  }
  const slugRaw = segments[1]
  const slug = slugRaw === "main" ? "demo" : slugRaw
  const tail = segments.slice(2).join("/")
  const target = tail ? `/project/${slug}/${tail}` : `/project/${slug}`
  return <Navigate to={`${target}${search}`} replace />
}

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
    return <Navigate to={`/project/demo/${rest}${search}`} replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (hasAdminPortalAccess(user)) {
    return <Navigate to="/admin/projects" replace />
  }

  const slug =
    user.defaultProjectSlug?.trim() || user.assignedProjects[0]?.slug || null

  if (!slug) {
    return <Navigate to="/no-project-assigned" replace />
  }

  const rest = legacyRestSegment(pathname)
  return <Navigate to={`/project/${slug}/${rest}${search}`} replace />
}
