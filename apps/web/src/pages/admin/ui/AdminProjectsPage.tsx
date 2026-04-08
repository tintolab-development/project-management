import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  AdminProjectCard,
  AdminProjectCreateSheet,
  AdminProjectsFilters,
  AdminProjectsToolbar,
  parseAdminProjectsListFilters,
  useAdminProjectsQuery,
  useDeleteAdminProjectMutation,
  type AdminProject,
} from "@/features/admin-projects"
import { appConfirm } from "@/shared/lib/appDialog"

import styles from "./AdminProjectsPage.module.css"

const getProjectOrderNumber = (project: AdminProject): number => {
  const match = /^ap-(\d+)$/.exec(project.id)
  if (!match) return 0
  return Number(match[1])
}

export const AdminProjectsPage = () => {
  const [searchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const applied = useMemo(
    () => parseAdminProjectsListFilters(searchParams),
    [searchParams],
  )

  const { data, isPending, isError, error } = useAdminProjectsQuery(applied)
  const { mutate: deleteProject, isPending: deletePending } =
    useDeleteAdminProjectMutation()

  const projects = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => getProjectOrderNumber(b) - getProjectOrderNumber(a),
      ),
    [data],
  )

  const handleCreateClick = useCallback(() => {
    setCreateOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (project: AdminProject) => {
      const label = project.name?.trim() || "이 프로젝트"
      const ok = await appConfirm(
        `「${label}」을(를) 삭제하면 복구할 수 없습니다. 계속하시겠습니까?`,
        {
          intent: "destructive",
          title: "프로젝트 삭제",
          confirmLabel: "삭제",
        },
      )
      if (!ok) return
      deleteProject(project.id)
    },
    [deleteProject],
  )

  return (
    <main className={styles.root}>
      <AdminProjectsFilters
        key={`${applied.q}|${applied.type}|${applied.status}|${applied.from}|${applied.to}`}
      />

      <AdminProjectsToolbar
        projectCount={projects.length}
        onCreateClick={handleCreateClick}
      />

      {isError ? (
        <p className={`${styles.stateMessage} ${styles.stateError}`} role="alert">
          {error instanceof Error ? error.message : "목록을 불러오지 못했습니다."}
        </p>
      ) : null}

      {isPending && !isError && data == null ? (
        <p className={styles.stateMessage} aria-live="polite">
          불러오는 중…
        </p>
      ) : null}

      {!isError && !isPending && projects.length === 0 ? (
        <p className={styles.stateMessage}>조건에 맞는 프로젝트가 없습니다.</p>
      ) : null}

      {!isError && projects.length > 0 ? (
        <div className={styles.cardGrid}>
          {projects.map((p) => (
            <AdminProjectCard
              key={p.id}
              project={p}
              deleteDisabled={deletePending}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}

      <AdminProjectCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </main>
  )
}
