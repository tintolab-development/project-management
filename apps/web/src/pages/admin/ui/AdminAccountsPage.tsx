import { Text } from "@/shared/ui/typography"

import styles from "./AdminPlaceholderPage.module.css"

export const AdminAccountsPage = () => (
  <section className={styles.root} aria-label="계정 관리">
    <Text as="p" variant="body">
      조직·역할·프로젝트 매핑 계정 관리(플레이스홀더)입니다.
    </Text>
  </section>
)
