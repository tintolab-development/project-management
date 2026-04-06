import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { FormLabel } from "@/shared/ui/typography"

import styles from "./FilterFieldShell.module.css"

export type FilterFieldShellProps = {
  label: string
  controlId: string
  children: ReactNode
  className?: string
  /** 그리드 등에서 행 너비를 균등 분배할 때 `max-width: 280px` 제한 해제 */
  fullWidth?: boolean
}

export function FilterFieldShell({
  label,
  controlId,
  children,
  className,
  fullWidth,
}: FilterFieldShellProps) {
  return (
    <div
      className={cn(
        styles.field,
        fullWidth && styles.fieldFullWidth,
        className,
      )}
    >
      <FormLabel htmlFor={controlId} className="mb-0">
        {label}
      </FormLabel>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
