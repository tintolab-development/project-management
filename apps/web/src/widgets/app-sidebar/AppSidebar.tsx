import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar"
import { cn } from "@/lib/utils"
import { Text } from "@/shared/ui/typography"

import { APP_SIDEBAR_NAV } from "./app-sidebar-nav-config"
import { AppSidebarBrand } from "./AppSidebarBrand"
import { AppSidebarNav } from "./AppSidebarNav"
import { AppSidebarPrinciples } from "./AppSidebarPrinciples"
import { AppSidebarProjectPanel } from "./AppSidebarProjectPanel"
import styles from "./AppSidebar.module.css"

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="none"
      aria-label="주요 내비게이션"
      className={cn(styles.root, "shrink-0")}
    >
      <SidebarHeader className={styles.headerSlot}>
        <AppSidebarBrand />
      </SidebarHeader>
      <SidebarContent className={styles.contentSlot}>
        <AppSidebarNav items={APP_SIDEBAR_NAV} />
        <AppSidebarProjectPanel />
        <AppSidebarPrinciples />
      </SidebarContent>
      <SidebarFooter className={styles.footerSlot}>
        <Text as="div" variant="sidebarFooter" className={styles.footer}>
          Prototype v7
        </Text>
      </SidebarFooter>
    </Sidebar>
  )
}
