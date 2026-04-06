import { useAppStore } from "@/app/store/useAppStore"
import { Overline, Text } from "@/shared/ui/typography"

import styles from "./AppSidebar.module.css"

export function AppSidebarProjectPanel() {
  const project = useAppStore((s) => s.project)

  return (
    <div className={styles.section}>
      <Overline tone="sidebar" className={styles.sectionHeading}>
        프로젝트
      </Overline>
      <div className={styles.projectCard}>
        <Text as="div" variant="sidebarProjectName">
          {project.name}
        </Text>
        <Text as="div" variant="sidebarProjectMeta">
          {project.subtitle}
        </Text>
      </div>
    </div>
  )
}
