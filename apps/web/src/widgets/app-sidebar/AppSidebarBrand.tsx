import { Text } from "@/shared/ui/typography"

import styles from "./AppSidebar.module.css"

export function AppSidebarBrand() {
  return (
    <div className={styles.brand}>
      <div className={styles.brandMark}>
        <img
          src="/seol-logo.png"
          alt="설해원 로고"
          className={styles.brandLogo}
          decoding="async"
        />
      </div>
      <div className={styles.brandCopy}>
        <Text as="div" variant="sidebarBrandName">
          Tintolab Decision Workspace
        </Text>
        <Text as="div" variant="sidebarBrandSub">
          Issue Item management
        </Text>
      </div>
    </div>
  )
}
