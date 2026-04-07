import { useNavigate } from "react-router-dom"

import { logoutRequest, useAuthSessionStore } from "@/features/auth"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Heading, Text } from "@/shared/ui/typography"

import styles from "./NoProjectAssignedPage.module.css"

export const NoProjectAssignedPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthSessionStore((s) => s.setSession)

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch {
      /* 목 API 실패해도 클라이언트 세션은 제거 */
    }
    setSession(null)
    navigate("/login", { replace: true })
  }

  return (
    <div className={styles.page}>
      <Card variant="panel" className={styles.card}>
        <CardHeader>
          <Heading as="h1" variant="loginHero">
            프로젝트가 할당되지 않았습니다
          </Heading>
        </CardHeader>
        <CardContent className={styles.body}>
          <Text as="p" variant="body">
            계정에 연결된 프로젝트가 없습니다. 관리자에게 할당을 요청한 뒤 다시
            로그인해 주세요.
          </Text>
          <Button
            type="button"
            appearance="fill"
            dimension="stretchMd"
            className={styles.action}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
