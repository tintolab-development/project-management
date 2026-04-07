import { matchPath } from "react-router-dom"

import { ADMIN_SIDEBAR_NAV } from "./admin-sidebar-nav-config"
import { APP_SIDEBAR_NAV, buildProjectSidebarNav } from "./app-sidebar-nav-config"

export const resolveShellPageTitle = (pathname: string): string => {
  for (const item of ADMIN_SIDEBAR_NAV) {
    const m = matchPath({ path: item.to, end: item.end ?? false }, pathname)
    if (m) return item.label
  }
  const projectMatch = pathname.match(/^\/project\/([^/]+)/)
  if (projectMatch) {
    const slug = projectMatch[1]
    for (const item of buildProjectSidebarNav(slug)) {
      const m = matchPath({ path: item.to, end: item.end ?? false }, pathname)
      if (m) return item.label
    }
  }
  for (const item of APP_SIDEBAR_NAV) {
    const m = matchPath({ path: item.to, end: item.end ?? false }, pathname)
    if (m) return item.label
  }
  if (pathname === "/no-project-assigned") return "프로젝트 미할당"
  return "App"
}
