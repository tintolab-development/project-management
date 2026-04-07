import type { AppSidebarNavItem } from "./app-sidebar-nav-config"

export const ADMIN_SIDEBAR_NAV: AppSidebarNavItem[] = [
  { to: "/admin/dashboard", end: true, label: "대시보드" },
  { to: "/admin/projects", label: "프로젝트 관리" },
  { to: "/admin/accounts", label: "계정 관리" },
  { to: "/admin/schedule", label: "일정 관리" },
  { to: "/admin/logs", label: "로그" },
]
