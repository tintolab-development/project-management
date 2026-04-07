import { Text } from "@/shared/ui/typography"

import styles from "./AdminPlaceholderPage.module.css"

export const AdminDashboardPage = () => (
  <section className={styles.root} aria-label="어드민 대시보드">
    <Text as="p" variant="body">
      틴토랩 관리자 홈입니다. 좌측 메뉴에서 프로젝트·계정·일정·로그를 관리할 수 있습니다.
    </Text>
  </section>
)
