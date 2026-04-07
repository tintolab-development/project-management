import { cn } from "@/lib/utils"
import { Text } from "@/shared/ui/typography"

import styles from "./AppSidebar.module.css"

type AppSidebarBrandProps = {
  variant: "admin" | "project"
}

export function AppSidebarBrand({ variant }: AppSidebarBrandProps) {
  const isAdmin = variant === "admin"

  return (
    <div className={cn(styles.brand, isAdmin && styles.brandAdmin)}>
      <div
        className={styles.brandMark}
        {...(isAdmin ? { "aria-label": "Tintolab 관리자 로고" } : {})}
      >
        {isAdmin ? (
          <span className={styles.brandLetterT} aria-hidden="true">
            T
          </span>
        ) : (
          <img
            src="/seol-logo.png"
            alt="설해원 로고"
            className={styles.brandLogo}
            decoding="async"
          />
        )}
      </div>
      <div className={cn(styles.brandCopy, isAdmin && styles.brandCopyAdmin)}>
        {isAdmin ? (
          <div className={styles.brandAdminTitle}>ADMIN</div>
        ) : (
          <Text as="div" variant="sidebarBrandName">
            Tintolab Decision Workspace
          </Text>
        )}
        {isAdmin ? null : (
          <Text as="div" variant="sidebarBrandSub">
            Issue Item management
          </Text>
        )}
      </div>
    </div>
  )
}
