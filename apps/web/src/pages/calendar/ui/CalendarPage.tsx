import { useNavigate } from "react-router-dom"

import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import { Button } from "@/shared/ui/button"
import { Heading, Text } from "@/shared/ui/typography"

import styles from "./CalendarPage.module.css"

export const CalendarPage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()

  const handleGoDashboard = () => {
    navigate(paths.dashboard)
  }

  return (
    <section className={styles.page} aria-label="Calendar 준비 중">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.content}>
        <Heading as="h1" variant="dashboardSection" className={styles.title}>
          Coming soon
        </Heading>
        <Text as="p" variant="body" className={styles.lead}>
          Calendar 기능은 준비 중입니다. 곧 일정 뷰와 연동을 제공할 예정입니다.
        </Text>
        <Button
          type="button"
          appearance="outline"
          dimension="fixedMd"
          className={styles.action}
          onClick={handleGoDashboard}
        >
          대시보드로 이동
        </Button>
      </div>
    </section>
  )
}
