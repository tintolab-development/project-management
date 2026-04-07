import { forwardRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"

import labelStyles from "./FilterFieldLabel.module.css"
import styles from "./FilterFieldShell.module.css"
import { filterFieldLabelDomId } from "./filterFieldLabelDomId"

export type FilterFieldShellProps = {
  label: string
  controlId: string
  children: ReactNode
  className?: string
  /** 열 전체 너비가 필요할 때만 사용(기본은 `--filter-field-max-width`) */
  fullWidth?: boolean
  /** 공통 필터 라벨 위에 덮어쓸 클래스(예: `sr-only`) */
  labelClassName?: string
  /** `.body` 래퍼 — 날짜 필터(shadcn outline 트리거) 등 이중 테두리 방지 */
  bodyClassName?: string
}

export const FilterFieldShell = forwardRef<HTMLDivElement, FilterFieldShellProps>(
  function FilterFieldShell(
    { label, controlId, children, className, fullWidth, labelClassName, bodyClassName },
    ref,
  ) {
    return (
      <div
        className={cn(
          styles.field,
          fullWidth && styles.fieldFullWidth,
          className,
        )}
      >
        <span
          id={filterFieldLabelDomId(controlId)}
          className={cn(labelStyles.filterFieldLabel, labelClassName)}
        >
          {label}
        </span>
        <div ref={ref} className={cn(styles.body, bodyClassName)}>
          {children}
        </div>
      </div>
    )
  },
)

FilterFieldShell.displayName = "FilterFieldShell"
