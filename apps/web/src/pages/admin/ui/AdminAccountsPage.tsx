import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  AdminAccountGroupTable,
  AdminAccountsFilters,
  AdminAccountsToolbar,
  AdminAccountRegisterSheet,
  AdminAffiliationCreateModal,
  mergeAdminAccountsFiltersIntoParams,
  mergeAdminAccountsGroupPagesIntoParams,
  parseAdminAccountsListState,
  useAdminAccountsGroupedQuery,
  useDeleteAdminAccountMemberMutation,
  type AdminAccountMember,
} from "@/features/admin-accounts"
import { appConfirm } from "@/shared/lib/appDialog"
import {
  EMPTY_ADMIN_PROJECTS_FILTERS,
  useAdminProjectsQuery,
  useDeleteAdminProjectMutation,
} from "@/features/admin-projects"

import styles from "./AdminAccountsPage.module.css"

export const AdminAccountsPage = () => {
  const [createAffiliationOpen, setCreateAffiliationOpen] = useState(false)
  const [registerProjectId, setRegisterProjectId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const applied = useMemo(
    () => parseAdminAccountsListState(searchParams),
    [searchParams],
  )

  const ongoingFilters = useMemo(
    () => ({
      ...EMPTY_ADMIN_PROJECTS_FILTERS,
      status: "in_progress",
    }),
    [],
  )

  const { data: ongoingProjects = [] } = useAdminProjectsQuery(ongoingFilters)

  const projectOptions = useMemo(
    () => [
      { value: "", label: "전체" },
      ...ongoingProjects.map((p) => ({ value: p.id, label: p.name })),
    ],
    [ongoingProjects],
  )

  const { data, isPending, isError, error } = useAdminAccountsGroupedQuery(applied)
  const { mutate: deleteMember, isPending: memberDeletePending } =
    useDeleteAdminAccountMemberMutation()
  const { mutate: deleteProject, isPending: organizationDeletePending } =
    useDeleteAdminProjectMutation()

  const handleTablePageChange = useCallback(
    (projectId: string, pageIndex0: number) => {
      const page = pageIndex0 + 1
      const groupPages = { ...applied.groupPages }
      if (page <= 1) {
        delete groupPages[projectId]
      } else {
        groupPages[projectId] = page
      }
      const mergedFilters = mergeAdminAccountsFiltersIntoParams(
        searchParams,
        {
          q: applied.q,
          project: applied.project,
          limit: applied.limit,
        },
      )
      const next = mergeAdminAccountsGroupPagesIntoParams(
        mergedFilters,
        groupPages,
      )
      setSearchParams(next, { replace: true })
    },
    [applied, searchParams, setSearchParams],
  )

  const handleCreateOrganization = useCallback(() => {
    setCreateAffiliationOpen(true)
  }, [])

  const handleAddMember = useCallback((projectId: string) => {
    setRegisterProjectId(projectId)
  }, [])

  const handleRegisterOpenChange = useCallback((next: boolean) => {
    if (!next) {
      setRegisterProjectId(null)
    }
  }, [])

  const handleRowDelete = useCallback(
    async (member: AdminAccountMember) => {
      const label = member.name?.trim() || "이 계정"
      const ok = await appConfirm(
        `「${label}」을(를) 삭제하면 복구할 수 없습니다. 계속하시겠습니까?`,
        {
          intent: "destructive",
          title: "계정 삭제",
          confirmLabel: "삭제",
        },
      )
      if (!ok) return
      deleteMember(member.id)
    },
    [deleteMember],
  )

  const anyAccountDeletePending =
    memberDeletePending || organizationDeletePending

  const handleDeleteOrganization = useCallback(
    async (projectId: string) => {
      const group = data?.groups.find((g) => g.projectId === projectId)
      const label = group?.projectName?.trim() || "이 소속"
      const ok = await appConfirm(
        `「${label}」 소속을 삭제하면 해당 소속의 프로젝트와 계정 목록이 함께 제거됩니다. 복구할 수 없습니다. 계속하시겠습니까?`,
        {
          intent: "destructive",
          title: "소속 삭제",
          confirmLabel: "삭제",
        },
      )
      if (!ok) return
      deleteProject(projectId)
    },
    [data?.groups, deleteProject],
  )

  return (
    <main className={styles.root}>
      <AdminAccountsFilters
        key={`${applied.q}|${applied.project}|${applied.limit}`}
        projectOptions={projectOptions}
      />

      <AdminAccountsToolbar
        organizationCount={data?.organizationCount ?? 0}
        onCreateOrganizationClick={handleCreateOrganization}
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

      {!isError && data && data.groups.length === 0 ? (
        <p className={styles.stateMessage}>조건에 맞는 소속이 없습니다.</p>
      ) : null}

      {!isError && data && data.groups.length > 0 ? (
        <div className={styles.tableStack}>
          {data.groups.map((group) => (
            <AdminAccountGroupTable
              key={group.projectId}
              group={group}
              onTablePageChange={handleTablePageChange}
              onAddMember={handleAddMember}
              onDeleteOrganization={handleDeleteOrganization}
              organizationDeletePending={anyAccountDeletePending}
              memberDeletePending={anyAccountDeletePending}
              onRowDelete={handleRowDelete}
            />
          ))}
        </div>
      ) : null}

      <AdminAffiliationCreateModal
        open={createAffiliationOpen}
        onOpenChange={setCreateAffiliationOpen}
      />

      <AdminAccountRegisterSheet
        open={registerProjectId != null}
        onOpenChange={handleRegisterOpenChange}
        projectId={registerProjectId}
      />
    </main>
  )
}
