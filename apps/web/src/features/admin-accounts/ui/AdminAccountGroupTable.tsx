import { useMemo } from "react"
import { Plus, Settings, Trash2 } from "lucide-react"
import type { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table"

import { Button } from "@/shared/ui/button"
import { DataTable } from "@/shared/ui/data-table"

import type { AdminAccountGroup, AdminAccountMember } from "../model/adminAccount"

import styles from "./AdminAccountGroupTable.module.css"

type Props = {
  group: AdminAccountGroup
  onTablePageChange: (projectId: string, pageIndex0: number) => void
  onDeleteOrganization?: (projectId: string) => void
  organizationDeletePending?: boolean
  memberDeletePending?: boolean
  onOrganizationSettings?: (projectId: string) => void
  onAddMember?: (projectId: string) => void
  onRowSettings?: (member: AdminAccountMember) => void
  onRowDelete?: (member: AdminAccountMember) => void
}

const buildColumns = (
  onRowSettings?: (member: AdminAccountMember) => void,
  onRowDelete?: (member: AdminAccountMember) => void,
  memberDeletePending?: boolean,
): ColumnDef<AdminAccountMember>[] => [
  {
    accessorKey: "affiliation",
    header: "소속",
  },
  {
    accessorKey: "name",
    header: "이름",
  },
  {
    accessorKey: "jobTitle",
    header: "직무",
  },
  {
    accessorKey: "email",
    header: "이메일",
  },
  {
    accessorKey: "phone",
    header: "전화번호",
  },
  {
    accessorKey: "permission",
    header: "권한",
  },
  {
    id: "rowActions",
    header: "",
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className={styles.rowActions}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${member.name} 계정 설정`}
            onClick={() => onRowSettings?.(member)}
          >
            <Settings className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${member.name} 계정 삭제`}
            disabled={memberDeletePending}
            onClick={() => onRowDelete?.(member)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      )
    },
  },
]

export const AdminAccountGroupTable = ({
  group,
  onTablePageChange,
  onDeleteOrganization,
  organizationDeletePending,
  memberDeletePending,
  onOrganizationSettings,
  onAddMember,
  onRowSettings,
  onRowDelete,
}: Props) => {
  const columns = useMemo(
    () => buildColumns(onRowSettings, onRowDelete, memberDeletePending),
    [onRowSettings, onRowDelete, memberDeletePending],
  )

  const pagination: PaginationState = {
    pageIndex: group.page - 1,
    pageSize: group.pageSize,
  }

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const prev: PaginationState = {
      pageIndex: group.page - 1,
      pageSize: group.pageSize,
    }
    const next = typeof updater === "function" ? updater(prev) : updater
    onTablePageChange(group.projectId, next.pageIndex)
  }

  const handleDeleteOrg = () => {
    onDeleteOrganization?.(group.projectId)
  }

  const handleSettingsOrg = () => {
    onOrganizationSettings?.(group.projectId)
  }

  const handleAddMember = () => {
    onAddMember?.(group.projectId)
  }

  return (
    <section className={styles.card} aria-labelledby={`org-heading-${group.projectId}`}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle} id={`org-heading-${group.projectId}`}>
          {group.projectName} | {group.totalCount}명
        </h2>
        <div className={styles.cardHeaderActions}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${group.projectName} 소속 삭제`}
            disabled={organizationDeletePending}
            onClick={handleDeleteOrg}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${group.projectName} 소속 설정`}
            onClick={handleSettingsOrg}
          >
            <Settings className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${group.projectName} 멤버 추가`}
            onClick={handleAddMember}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <DataTable
          columns={columns}
          data={group.rows}
          pageSize={group.pageSize}
          manualPagination
          pageCount={group.totalPages}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          getRowId={(row) => row.id}
          emptyMessage="표시할 계정이 없습니다."
          tableClassName={styles.table}
        />
      </div>
    </section>
  )
}
