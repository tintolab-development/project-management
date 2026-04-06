import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Heading, Text } from "@/shared/ui/typography"
import { useAppStore } from "@/app/store/useAppStore"
import { logoutRequest, useAuthSessionStore } from "@/features/auth"
import { NewItemModal } from "@/features/new-item/ui/NewItemModal"
import { BulkImportModal } from "@/features/bulk-import/ui/BulkImportModal"

import styles from "./TopBar.module.css"

export const TopBar = () => {
  const navigate = useNavigate()
  const [newOpen, setNewOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const exportStateJson = useAppStore((s) => s.exportStateJson)
  const resetToSample = useAppStore((s) => s.resetToSample)
  const authUser = useAuthSessionStore((s) => s.user)
  const setSession = useAuthSessionStore((s) => s.setSession)

  const handleExportJson = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-")
    const blob = new Blob([exportStateJson()], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tdw-prototype-export-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => resetToSample()

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
    <header className={styles.root}>
      <div>
        <Heading as="h1" variant="display">
          프로젝트 의사결정 아이템 관리시스템
        </Heading>
        <Text variant="lead" className={styles.leadSpacing} as="div">
          원할한 프로젝트 수행을 위해 도메인 항목에 해당하는 의사결정 아이템을
          효율적으로 관리합니다.
        </Text>
      </div>

      <div className={styles.actions}>
        {import.meta.env.DEV && authUser ? (
          <Text variant="small" as="span" className="self-center text-muted-foreground">
            {authUser.displayName}
          </Text>
        ) : null}
        <Button
          type="button"
          appearance="fill"
          dimension="hug"
          onClick={() => setNewOpen(true)}
        >
          새 항목 만들기
        </Button>
        <Button
          type="button"
          appearance="outline"
          dimension="hug"
          onClick={() => setImportOpen(true)}
        >
          엑셀 일괄등록
        </Button>
        <Button
          type="button"
          appearance="outline"
          dimension="hug"
          onClick={handleExportJson}
        >
          JSON보내기
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          샘플데이터 초기화
        </Button>
        {import.meta.env.DEV ? (
          <Button type="button" variant="ghost" onClick={handleLogout}>
            로그아웃
          </Button>
        ) : null}
      </div>

      <NewItemModal open={newOpen} onOpenChange={setNewOpen} />
      <BulkImportModal open={importOpen} onOpenChange={setImportOpen} />
    </header>
  )
}
