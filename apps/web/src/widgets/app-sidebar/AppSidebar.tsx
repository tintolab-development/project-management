import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar"
import { cn } from "@/lib/utils"
import { Text } from "@/shared/ui/typography"

import type { AppSidebarNavItem } from "./app-sidebar-nav-config"

export type AppSidebarShellVariant = "admin" | "project"
import { AppSidebarBrand } from "./AppSidebarBrand"
import { AppSidebarNav } from "./AppSidebarNav"
import { AppSidebarPrinciples } from "./AppSidebarPrinciples"
import { AppSidebarProjectPanel } from "./AppSidebarProjectPanel"
import styles from "./AppSidebar.module.css"

type Props = {
  variant: AppSidebarShellVariant
  navItems: readonly AppSidebarNavItem[]
  projectBasePath?: string
}

export function AppSidebar({ variant, navItems, projectBasePath }: Props) {
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
        {variant === "project" ? <AppSidebarProjectPanel /> : null}
        <AppSidebarNav items={navItems} projectBasePath={projectBasePath} />
      </SidebarContent>
      <SidebarFooter className={styles.footerSlot}>
        <AppSidebarPrinciples />
        <Text as="div" variant="sidebarFooter" className={styles.footerMeta}>
          Prototype v7
        </Text>
      </SidebarFooter>
    </Sidebar>
  )
}
