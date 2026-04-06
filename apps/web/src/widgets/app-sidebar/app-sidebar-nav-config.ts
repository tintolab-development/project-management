export type AppSidebarNavItem = {
  to: string
  label: string
  end?: boolean
}

export const APP_SIDEBAR_NAV: AppSidebarNavItem[] = [
  { to: "/", end: true, label: "Dashboard" },
  { to: "/workspaces", label: "Workspaces" },
  { to: "/items", label: "Items" },
  { to: "/tree", label: "Item Tree" },
  { to: "/calendar", label: "Calendar" },
]
