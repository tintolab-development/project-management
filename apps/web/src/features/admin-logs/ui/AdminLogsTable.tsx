import { useMemo, useState, type CSSProperties } from "react"
import type { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table"

import { DataTable } from "@/shared/ui/data-table"

import { formatAdminLogEditedAt } from "../lib/formatAdminLogEditedAt"
import type { AdminLogRow } from "../model/adminLog"

import { AdminLogDetailModal } from "./AdminLogDetailModal"
import styles from "./AdminLogsTable.module.css"

type Props = {
  rows: AdminLogRow[]
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (nextPage: number) => void
}

const buildColumns = (): ColumnDef<AdminLogRow>[] => [
  {
    accessorKey: "editedAt",
    header: "수정일시",
    cell: ({ row }) => formatAdminLogEditedAt(row.original.editedAt),
  },
  {
    accessorKey: "projectName",
    header: "프로젝트",
    cell: ({ row }) => row.original.projectName,
  },
  {
    accessorKey: "category",
    header: "분류",
  },
  {
    accessorKey: "itemName",
    header: "아이템",
    cell: ({ row }) => row.original.itemName,
  },
  {
    accessorKey: "editContent",
    header: "수정내용",
    cell: ({ row }) => row.original.editContent,
  },
  {
    accessorKey: "affiliation",
    header: "소속",
  },
  {
    accessorKey: "editor",
    header: "수정자",
  },
  {
    accessorKey: "ip",
    header: "IP",
  },
]

export const AdminLogsTable = ({
  rows,
  page,
  pageSize,
  totalPages,
  onPageChange,
}: Props) => {
  const [detailLog, setDetailLog] = useState<AdminLogRow | null>(null)
  const columns = useMemo(() => buildColumns(), [])

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  }

  const pageCount = Math.max(1, totalPages)

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const prev: PaginationState = {
      pageIndex: page - 1,
      pageSize,
    }
    const next = typeof updater === "function" ? updater(prev) : updater
    onPageChange(next.pageIndex + 1)
  }

  return (
    <div
      className={styles.tableWrap}
      style={
        {
          "--admin-logs-table-page-size": pageSize,
        } as CSSProperties
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        pageSize={pageSize}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        getRowId={(row) => row.id}
        emptyMessage="조건에 맞는 로그가 없습니다."
        tableClassName={styles.table}
        tableSlotClassName={styles.tableSlotStable}
        onDataRowClick={(row) => setDetailLog(row)}
      />
      <AdminLogDetailModal
        open={detailLog !== null}
        log={detailLog}
        onOpenChange={(next) => {
          if (!next) setDetailLog(null)
        }}
      />
    </div>
  )
}
