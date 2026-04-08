import { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DataTablePagination } from "./DataTablePagination"

import styles from "./DataTable.module.css"

const DEFAULT_PAGE_SIZE = 20

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** 페이지당 행 수 (기본 20) */
  pageSize?: number
  className?: string
  emptyMessage?: string
  /** 바깥에서 페이지 상태를 제어할 때 (서버 페이지네이션 등) */
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  manualPagination?: boolean
  pageCount?: number
  /** 숫자 페이지 버튼 최대 개수 */
  maxNumericPageButtons?: number
  /** 헤더 행 스타일 */
  headerRowClassName?: string
  /** `<table>` 요소 클래스 — 페이지별 테이블 레이아웃·보더 등 */
  tableClassName?: string
  /** 테이블 래퍼(헤더+본문 슬롯) — 서버 페이지네이션 등에서 `min-height`로 시프트 완화 */
  tableSlotClassName?: string
  /** 행 식별자 (서버 페이지네이션 등에서 권장) */
  getRowId?: (originalRow: TData, index: number) => string
  /** 데이터 행 클릭 시 (헤더·빈 상태 행 제외) */
  onDataRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
  emptyMessage = "데이터가 없습니다.",
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  pageCount,
  maxNumericPageButtons = 10,
  headerRowClassName,
  tableClassName,
  tableSlotClassName,
  getRowId,
  onDataRowClick,
}: DataTableProps<TData, TValue>) {
  const [uncontrolledPagination, setUncontrolledPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize,
    })

  useEffect(() => {
    if (controlledPagination !== undefined) return
    setUncontrolledPagination((prev) => ({
      ...prev,
      pageSize,
      pageIndex: 0,
    }))
  }, [pageSize, controlledPagination])

  const pagination =
    controlledPagination !== undefined
      ? controlledPagination
      : uncontrolledPagination

  const setPagination: OnChangeFn<PaginationState> = (updater) => {
    if (onPaginationChange) {
      onPaginationChange(updater)
      return
    }
    setUncontrolledPagination(updater)
  }

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack useReactTable
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    ...(getRowId ? { getRowId } : {}),
  })

  return (
    <div className={cn("space-y-0", className)}>
      <div className={cn(styles.tableSlot, tableSlotClassName)}>
      <Table className={tableClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(
                "border-b-0 bg-muted/40 hover:bg-muted/40",
                headerRowClassName,
              )}
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  onDataRowClick &&
                    "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                tabIndex={onDataRowClick ? 0 : undefined}
                aria-label={onDataRowClick ? "상세 내용 보기" : undefined}
                onClick={
                  onDataRowClick
                    ? () => onDataRowClick(row.original)
                    : undefined
                }
                onKeyDown={
                  onDataRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onDataRowClick(row.original)
                        }
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      <div className={styles.paginationSlot}>
        <DataTablePagination
          table={table}
          maxNumericButtons={maxNumericPageButtons}
        />
      </div>
    </div>
  )
}
