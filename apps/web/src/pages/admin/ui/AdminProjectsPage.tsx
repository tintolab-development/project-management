import { Text } from "@/shared/ui/typography"

import styles from "./AdminPlaceholderPage.module.css"

export const AdminProjectsPage = () => (
  <section className={styles.root} aria-label="프로젝트 관리">
    <Text as="p" variant="body">
      전사 프로젝트 목록·생성·설정(플레이스홀더)입니다.
    </Text>
  </section>
)
