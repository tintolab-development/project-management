import { Text } from "@/shared/ui/typography"

import styles from "./AdminPlaceholderPage.module.css"

export const AdminLogsPage = () => (
  <section className={styles.root} aria-label="로그">
    <Text as="p" variant="body">
      감사·접속·변경 이력 로그(플레이스홀더)입니다.
    </Text>
  </section>
)
