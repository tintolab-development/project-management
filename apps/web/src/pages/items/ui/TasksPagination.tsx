import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getTasksPaginationRange } from "../lib/tasksPaginationRange"

export type TasksPaginationProps = {
  currentPage: number
  totalPages: number
  /** 페이지당 항목 수(기본 10) — 접근성 라벨에 반영 */
  pageSize?: number
  onPageChange: (page: number) => void
}

export const TasksPagination = ({
  currentPage,
  totalPages,
  pageSize = 10,
  onPageChange,
}: TasksPaginationProps) => {
  if (totalPages < 1) return null

  const items = getTasksPaginationRange(currentPage, totalPages)

  return (
    <Pagination
      className="mx-0 w-full justify-center border-0 shadow-none"
      aria-label={`페이지네이션, 페이지당 ${pageSize}개`}
    >
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            type="button"
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          />
        </PaginationItem>
        {items.map((entry, idx) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                type="button"
                isActive={entry === currentPage}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            type="button"
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
            }
            onClick={() =>
              onPageChange(Math.min(totalPages, currentPage + 1))
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
