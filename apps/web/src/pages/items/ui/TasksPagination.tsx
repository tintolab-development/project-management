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
  onPageChange: (page: number) => void
}

export const TasksPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: TasksPaginationProps) => {
  if (totalPages <= 1) return null

  const items = getTasksPaginationRange(currentPage, totalPages)

  return (
    <Pagination className="mx-0 w-full justify-center border-0 shadow-none">
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
