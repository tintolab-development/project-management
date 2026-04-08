import { X } from "lucide-react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import type { EventCalendarItem } from "../model/types"

import styles from "./EventCalendarItemDetailPanel.module.css"

export type EventCalendarItemDetailPanelProps = {
  event: EventCalendarItem
  anchorRect: DOMRect
  onRequestClose: () => void
  onPointerEnterPanel: () => void
  onPointerLeavePanel: () => void
}

const GAP = 8

export const EventCalendarItemDetailPanel = ({
  event,
  anchorRect,
  onRequestClose,
  onPointerEnterPanel,
  onPointerLeavePanel,
}: EventCalendarItemDetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onRequestClose])

  const preview = event.preview
  const left = Math.min(
    Math.max(8, anchorRect.left),
    typeof window !== "undefined" ? window.innerWidth - 320 - 8 : anchorRect.left,
  )
  const top = anchorRect.bottom + GAP

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="일정 상세"
      tabIndex={-1}
      className={styles.panel}
      style={{ left, top }}
      onMouseEnter={onPointerEnterPanel}
      onMouseLeave={onPointerLeavePanel}
    >
      <div className={styles.header}>
        <div className={styles.headerText}>
          {preview?.itemCode ? (
            <p className={styles.itemCode}>{preview.itemCode}</p>
          ) : null}
          <p className={styles.itemName}>
            {preview?.itemName ?? event.title}
          </p>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="상세 닫기"
          onClick={onRequestClose}
        >
          <X className={styles.closeIcon} aria-hidden />
        </button>
      </div>

      {preview?.tags && preview.tags.length > 0 ? (
        <ul className={styles.tagList}>
          {preview.tags.map((tag, idx) => (
            <li key={`${tag.label}-${idx}`}>
              <span className={cn(styles.tag, tag.className)}>{tag.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {preview?.categoryLabel ? (
        <p className={styles.metaLine}>분류 : {preview.categoryLabel}</p>
      ) : null}

      {preview?.assignees ? (
        <p className={styles.metaLine}>담당자 : {preview.assignees}</p>
      ) : null}

      {preview?.dueDate ? (
        <p className={styles.metaLine}>완료예정일 : {preview.dueDate}</p>
      ) : null}

      {preview?.description ? (
        <p className={styles.description}>{preview.description}</p>
      ) : null}
    </div>
  )
}
