export type AppSidebarNavItem = {
  to: string
  label: string
  end?: boolean
}

export const APP_SIDEBAR_NAV: AppSidebarNavItem[] = [
  { to: "/", end: true, label: "Dashboard" },
  { to: "/workspaces", label: "Workspace" },
  { to: "/tasks", label: "Tasks" },
  { to: "/tree", label: "Task Tree" },
  { to: "/calendar", label: "Calendar" },
]

export const buildProjectSidebarNav = (projectSlug: string): AppSidebarNavItem[] => {
  const base = `/p/${projectSlug}`
  return [
    { to: `${base}/dashboard`, end: true, label: "Dashboard" },
    { to: `${base}/workspaces`, label: "Workspace" },
    { to: `${base}/tasks`, label: "Tasks" },
    { to: `${base}/tree`, label: "Task Tree" },
    { to: `${base}/calendar`, label: "Calendar" },
  ]
}
