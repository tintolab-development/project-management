import type { CSSProperties } from "react"
import { Outlet, useParams } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"
import { AppSidebar, type AppSidebarShellVariant } from "@/widgets/app-sidebar"
import { ADMIN_SIDEBAR_NAV } from "@/widgets/app-sidebar/admin-sidebar-nav-config"
import { buildProjectSidebarNav } from "@/widgets/app-sidebar/app-sidebar-nav-config"
import { TopBar } from "@/widgets/top-bar/TopBar"

import styles from "./AppShellLayout.module.css"

const sidebarLayoutStyle = {
  "--sidebar-width": "300px",
} as CSSProperties

type Props = {
  variant: AppSidebarShellVariant
}

export const AppShellLayout = ({ variant }: Props) => {
  const { projectSlug = "" } = useParams<{ projectSlug?: string }>()

  if (variant === "admin") {
    return (
      <SidebarProvider className={styles.shellWrapper} style={sidebarLayoutStyle}>
        <AppSidebar variant="admin" navItems={ADMIN_SIDEBAR_NAV} />
        <SidebarInset className={styles.main}>
          <TopBar />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const navItems = buildProjectSidebarNav(projectSlug)
  const projectBasePath = projectSlug ? `/p/${projectSlug}` : undefined

  return (
    <SidebarProvider className={styles.shellWrapper} style={sidebarLayoutStyle}>
      <AppSidebar
        variant="project"
        navItems={navItems}
        projectBasePath={projectBasePath}
      />
      <SidebarInset className={styles.main}>
        <TopBar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
