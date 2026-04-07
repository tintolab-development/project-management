import type { AppSidebarNavItem } from "./app-sidebar-nav-config"

export const ADMIN_SIDEBAR_NAV: AppSidebarNavItem[] = [
  { to: "/admin/projects", end: true, label: "프로젝트 관리" },
  { to: "/admin/accounts", end: true, label: "계정 관리" },
  { to: "/admin/schedule", end: true, label: "일정 관리" },
  { to: "/admin/logs", end: true, label: "로그" },
]
