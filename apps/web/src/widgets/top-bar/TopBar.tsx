import { Bell, LogOut } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
// import { Button } from "@/shared/ui/button"
import { Heading } from "@/shared/ui/typography"
import { resolveShellPageTitle } from "@/widgets/app-sidebar/shellPageTitle"
// import { useAppStore } from "@/app/store/useAppStore"
import { logoutRequest, useAuthSessionStore } from "@/features/auth"
// import { NewItemModal } from "@/features/new-item/ui/NewItemModal"
// import { BulkImportModal } from "@/features/bulk-import/ui/BulkImportModal"

import styles from "./TopBar.module.css"

export const TopBar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pageTitle = resolveShellPageTitle(pathname)
  // const [newOpen, setNewOpen] = useState(false)
  // const [importOpen, setImportOpen] = useState(false)
  // const exportStateJson = useAppStore((s) => s.exportStateJson)
  // const resetToSample = useAppStore((s) => s.resetToSample)
  const authUser = useAuthSessionStore((s) => s.user)
  const setSession = useAuthSessionStore((s) => s.setSession)

  // const handleExportJson = () => {
  //   const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  //   const blob = new Blob([exportStateJson()], {
  //     type: "application/json;charset=utf-8",
  //   })
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement("a")
  //   a.href = url
  //   a.download = `tdw-prototype-export-${stamp}.json`
  //   document.body.appendChild(a)
  //   a.click()
  //   a.remove()
  //   URL.revokeObjectURL(url)
  // }

  // const handleReset = () => resetToSample()

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
      <div className={styles.titleBlock}>
        <Heading as="h1" variant="shellPageTitle">
          {pageTitle}
        </Heading>
      </div>

      <div className={styles.trailing}>
        {/*
        <div className={styles.toolActions}>
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
          {import.meta.env.DEV ? (
            <>
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
            </>
          ) : null}
        </div>
        */}

        {authUser ? (
          <div className={styles.sessionRail} aria-label="계정 및 알림">
            <button
              type="button"
              className={styles.iconButton}
              aria-label="알림"
            >
              <Bell
                className={styles.bellIcon}
                strokeWidth={1.65}
                aria-hidden
              />
            </button>
            <div className={styles.userPill}>
              <span className={styles.userPillLabel}>
                {authUser.displayName} |{" "}
                {authUser.organization?.trim() || "—"}
              </span>
              <button
                type="button"
                className={styles.pillIconButton}
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                <LogOut
                  className={styles.sessionIcon}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* <NewItemModal open={newOpen} onOpenChange={setNewOpen} /> */}
      {/* <BulkImportModal open={importOpen} onOpenChange={setImportOpen} /> */}
    </header>
  )
}
