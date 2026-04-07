import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

import styles from "./Tag.module.css"

export type TagProps = {
  children: ReactNode
  /** 텍스트 색 (예: `#334155`, `var(--text-pill-dark)`) */
  textColor: string
  /** 배경 색 */
  backgroundColor: string
  /** 테두리 색 */
  borderColor: string
  className?: string
  style?: CSSProperties
}

export function Tag({
  children,
  textColor,
  backgroundColor,
  borderColor,
  className,
  style,
}: TagProps) {
  return (
    <span
      className={cn(styles.root, className)}
      style={{
        color: textColor,
        backgroundColor,
        borderColor,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
