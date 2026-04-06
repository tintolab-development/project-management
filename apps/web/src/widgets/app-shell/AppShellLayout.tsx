import type { CSSProperties } from "react"
import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"
import { AppSidebar } from "@/widgets/app-sidebar"
import { TopBar } from "@/widgets/top-bar/TopBar"

import styles from "./AppShellLayout.module.css"

const sidebarLayoutStyle = {
  "--sidebar-width": "280px",
} as CSSProperties

export const AppShellLayout = () => (
  <SidebarProvider className={styles.shellWrapper} style={sidebarLayoutStyle}>
    <AppSidebar />
    <SidebarInset className={styles.main}>
      <TopBar />
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
)
