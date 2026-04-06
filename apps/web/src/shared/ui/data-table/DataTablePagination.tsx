import type { Table } from "@tanstack/react-table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

import { getVisiblePageIndices } from "./lib/getVisiblePageIndices"

export type DataTablePaginationProps<TData> = {
  table: Table<TData>
  /** 숫자 페이지 버튼 최대 개수 (기본 10) */
  maxNumericButtons?: number
  className?: string
}

export function DataTablePagination<TData>({
  table,
  maxNumericButtons = 10,
  className,
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()
  if (pageCount <= 1) return null

  const pageIndex = table.getState().pagination.pageIndex
  const items = getVisiblePageIndices(pageIndex, pageCount, maxNumericButtons)

  return (
    <Pagination className={cn("pt-4", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          />
        </PaginationItem>
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={pageIndex === item}
                aria-label={`${item + 1} 페이지`}
                onClick={() => table.setPageIndex(item)}
              >
                {item + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
