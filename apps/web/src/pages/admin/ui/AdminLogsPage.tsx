import { useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import {
  AdminLogsFilters,
  AdminLogsTable,
  mergeAdminLogsPageIntoParams,
  parseAdminLogsListState,
  useAdminLogsQuery,
} from "@/features/admin-logs"
import {
  EMPTY_ADMIN_PROJECTS_FILTERS,
  useAdminProjectsQuery,
} from "@/features/admin-projects"

import styles from "./AdminLogsPage.module.css"

export const AdminLogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const applied = useMemo(
    () => parseAdminLogsListState(searchParams),
    [searchParams],
  )

  const { data: projects = [] } = useAdminProjectsQuery(
    EMPTY_ADMIN_PROJECTS_FILTERS,
  )

  const projectOptions = useMemo(
    () => [
      { value: "", label: "전체" },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ],
    [projects],
  )

  const { data, isPending, isError, error } = useAdminLogsQuery(applied)

  useEffect(() => {
    if (!data) return
    if (data.page === applied.page) return
    setSearchParams(
      mergeAdminLogsPageIntoParams(searchParams, data.page),
      { replace: true },
    )
  }, [applied.page, data, searchParams, setSearchParams])

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setSearchParams(
        mergeAdminLogsPageIntoParams(searchParams, nextPage),
        { replace: true },
      )
    },
    [searchParams, setSearchParams],
  )

  return (
    <main className={styles.root}>
      <AdminLogsFilters
        key={`${applied.project}|${applied.q}|${applied.affiliation}`}
        projectOptions={projectOptions}
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

      {!isError && data ? (
        <AdminLogsTable
          rows={data.items}
          page={data.page}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
    </main>
  )
}
