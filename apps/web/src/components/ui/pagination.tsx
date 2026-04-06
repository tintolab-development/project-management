import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="페이지네이션"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />
}

type PaginationLinkProps = Omit<React.ComponentProps<typeof Button>, "size"> & {
  isActive?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
}

function PaginationLink({
  className,
  isActive,
  size = "sm",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      type="button"
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn("size-8 p-0", className)}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = "이전",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & { text?: string }) {
  return (
    <Button
      type="button"
      aria-label="이전 페이지"
      variant="outline"
      size="sm"
      className={cn("h-8 gap-1 pr-2 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="size-4 shrink-0" />
      <span>{text}</span>
    </Button>
  )
}

function PaginationNext({
  className,
  text = "다음",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & { text?: string }) {
  return (
    <Button
      type="button"
      aria-label="다음 페이지"
      variant="outline"
      size="sm"
      className={cn("h-8 gap-1 pr-2.5 pl-2", className)}
      {...props}
    >
      <span>{text}</span>
      <ChevronRight className="size-4 shrink-0" />
    </Button>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex size-8 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4 text-muted-foreground" />
      <span className="sr-only">더 많은 페이지</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
