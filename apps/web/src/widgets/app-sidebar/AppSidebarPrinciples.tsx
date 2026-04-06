import { Overline, Text } from "@/shared/ui/typography"

import styles from "./AppSidebar.module.css"

const PRINCIPLES = [
  "이슈아이템 초안 틴토랩작성",
  "담당자 별 이슈아이템 확인",
  "확정처리된 리포트 메일송부",
  "확정처리 아이템 변경 시 일정반영",
] as const

export function AppSidebarPrinciples() {
  return (
    <div className={styles.section}>
      <Overline tone="sidebar" className={styles.sectionHeading}>
        의사결정 원칙
      </Overline>
      <Text as="ul" variant="sidebarList">
        {PRINCIPLES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </Text>
    </div>
  )
}
