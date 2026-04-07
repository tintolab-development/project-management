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

const DEFAULT_PAGE_SIZE = 10

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** 페이지당 행 수 (기본 10) */
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
  })

  return (
    <div className={cn("space-y-0", className)}>
      <Table>
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
              <TableRow key={row.id}>
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
      <DataTablePagination
        table={table}
        maxNumericButtons={maxNumericPageButtons}
      />
    </div>
  )
}
