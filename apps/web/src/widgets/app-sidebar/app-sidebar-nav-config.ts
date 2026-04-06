export type AppSidebarNavItem = {
  to: string
  label: string
  end?: boolean
}

export const APP_SIDEBAR_NAV: AppSidebarNavItem[] = [
  { to: "/", end: true, label: "Dashboard" },
  { to: "/workspaces", label: "Workspace" },
  { to: "/items", label: "Tasks" },
  { to: "/tree", label: "Task Tree" },
  { to: "/calendar", label: "Calendar" },
]
