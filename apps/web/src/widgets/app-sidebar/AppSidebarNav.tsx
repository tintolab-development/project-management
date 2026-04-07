import { NavLink, useMatch } from "react-router-dom"
import { useAppStore } from "@/app/store/useAppStore"
import { buildWorkspacesPath } from "@/shared/config/workspaceRoute"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar"
import { Text } from "@/shared/ui/typography"

import type { AppSidebarNavItem } from "./app-sidebar-nav-config"
import styles from "./AppSidebar.module.css"

type Props = {
  items: readonly AppSidebarNavItem[]
  projectBasePath?: string
}

export function AppSidebarNav({ items, projectBasePath }: Props) {
  return (
    <nav className={styles.nav} aria-label="페이지">
      <SidebarGroup className={styles.navGroup}>
        <SidebarGroupContent>
          <SidebarMenu className={styles.navMenu}>
            {items.map((item) => (
              <AppSidebarNavRow
                key={item.to + String(item.end ?? false)}
                item={item}
                projectBasePath={projectBasePath}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  )
}

function AppSidebarNavRow({
  item,
  projectBasePath,
}: {
  item: AppSidebarNavItem
  projectBasePath?: string
}) {
  const match = useMatch({ path: item.to, end: item.end ?? false })
  const activeWorkspace = useAppStore((s) => s.ui.activeWorkspace)
  const isWorkspaces =
    item.to === "/workspaces" || item.to.endsWith("/workspaces")
  const to = isWorkspaces
    ? buildWorkspacesPath(activeWorkspace, { projectBasePath })
    : item.to

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<NavLink to={to} end={item.end} />}
        isActive={!!match}
        className={styles.navMenuButton}
        size="lg"
      >
        <Text as="span" variant="sidebarNav">
          {item.label}
        </Text>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
