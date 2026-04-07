import { Text } from "@/shared/ui/typography"

import styles from "./AdminPlaceholderPage.module.css"

export const AdminSchedulePage = () => (
  <section className={styles.root} aria-label="일정 관리">
    <Text as="p" variant="body">
      크로스 프로젝트 일정·슬롯 정책(플레이스홀더)입니다.
    </Text>
  </section>
)
