import {
  DndContext,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useCallback, useMemo, useRef } from "react"

import { useAppStore } from "@/app/store/useAppStore"
import { ItemBoardCard } from "@/entities/item/ui/ItemBoardCard"
import { sortItemsByBoardRank } from "@/entities/item/lib/sortItemsByBoard"
import type { Item } from "@/entities/item/model/types"
import {
  STATUS_LABELS,
  STATUS_VALUES,
  type ItemStatus,
} from "@/shared/constants/labels"
import { Text } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

import { mergeVisibleReorderIntoStatusOrder } from "../lib/mergeWorkspaceVisibleReorder"
import { useWorkspaceBoardSync } from "../model/useWorkspaceBoardSync"
import styles from "./WorkspaceBoard.module.css"

export type WorkspaceBoardProps = {
  workspaceItems: Item[]
  dndDisabled: boolean
  getDomainLabel: (domainId: string) => string
  onOpenItem: (itemId: string) => void
}

const isItemStatus = (v: string): v is ItemStatus =>
  (STATUS_VALUES as readonly string[]).includes(v)

function SortableWorkspaceCard({
  item,
  dndDisabled,
  getDomainLabel,
  onOpenItem,
}: {
  item: Item
  dndDisabled: boolean
  getDomainLabel: (domainId: string) => string
  onOpenItem: (itemId: string) => void
}) {
  /**
   * 확정 컬럼 카드는 잠금이어도 보드에서 다른 컬럼으로 끌어 상태 되돌리기 가능해야 함.
   * 확정이 아닌데 잠금만 된 경우(비정상)만 드래그 막음.
   */
  const cannotDragCard =
    dndDisabled || (item.isLocked && item.status !== "확정")
  const disabled = cannotDragCard
    ? dndDisabled
      ? { draggable: true, droppable: true }
      : { draggable: true, droppable: false }
    : false
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: item.id,
      disabled,
      data: { kind: "card" as const, status: item.status },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(styles.sortableCardRow, isDragging && styles.sortableCardRowDragging)}
    >
      <button
        type="button"
        className={styles.cardDragHandle}
        {...listeners}
        {...attributes}
        disabled={cannotDragCard}
        aria-label={`${item.code} 순서 변경`}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <div className={styles.cardGrow}>
        <ItemBoardCard
          item={item}
          getDomainLabel={getDomainLabel}
          onOpen={onOpenItem}
        />
      </div>
    </div>
  )
}

function WorkspaceStatusColumn({
  status,
  columnItems,
  dndDisabled,
  getDomainLabel,
  onOpenItem,
}: {
  status: ItemStatus
  columnItems: Item[]
  dndDisabled: boolean
  getDomainLabel: (domainId: string) => string
  onOpenItem: (itemId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status,
    disabled: dndDisabled,
    data: { kind: "column" as const },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const ids = columnItems.map((i) => i.id)

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `col-drop-${status}`,
    data: { kind: "columnDrop" as const, status },
    disabled: dndDisabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        styles.boardColumn,
        isDragging && styles.boardColumnDragging,
      )}
    >
      <div
        ref={setDropRef}
        className={cn(
          styles.columnDropSurface,
          isOver && styles.columnDropSurfaceActive,
        )}
      >
        <div className={styles.boardColumnHead}>
          <button
            type="button"
            className={styles.columnDragHandle}
            {...listeners}
            {...attributes}
            disabled={dndDisabled}
            aria-label={`${STATUS_LABELS[status]} 컬럼 옮기기`}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
          <div className={styles.boardColumnHeadTitles}>
            <Text as="span" variant="boardColumnHead">
              {STATUS_LABELS[status]}
            </Text>
            <Text as="span" variant="boardColumnHead">
              {columnItems.length}
            </Text>
          </div>
        </div>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={styles.cardStack}>
            {columnItems.map((item) => (
              <SortableWorkspaceCard
                key={item.id}
                item={item}
                dndDisabled={dndDisabled}
                getDomainLabel={getDomainLabel}
                onOpenItem={onOpenItem}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export function WorkspaceBoard({
  workspaceItems,
  dndDisabled,
  getDomainLabel,
  onOpenItem,
}: WorkspaceBoardProps) {
  const columnOrder = useAppStore((s) => s.ui.workspaceColumnOrder)
  const setWorkspaceColumnOrder = useAppStore((s) => s.setWorkspaceColumnOrder)
  const reorderWorkspaceItemsInStatus = useAppStore(
    (s) => s.reorderWorkspaceItemsInStatus,
  )
  const moveWorkspaceCardToStatus = useAppStore(
    (s) => s.moveWorkspaceCardToStatus,
  )
  const syncMutation = useWorkspaceBoardSync()

  const visibleIdSet = useMemo(
    () => new Set(workspaceItems.map((i) => i.id)),
    [workspaceItems],
  )

  const overHintRef = useRef<{
    kind?: string
    status?: ItemStatus
    overId: string
  } | null>(null)

  /**
   * 컬럼 전체가 useSortable(setNodeRef)로 감싸져 있으면, 카드 드래그 시 충돌이
   * 항상 출발 컬럼(부모)로 잡혀 컬럼 간 이동이 막힌다.
   * 카드 드래그일 때는 column 래퍼를 충돌 후보에서 제외하고 card·columnDrop만 본다.
   */
  const collisionDetection = useMemo<CollisionDetection>(
    () => (args) => {
      const activeKind = args.active.data.current?.kind

      if (activeKind === "card") {
        const containers = args.droppableContainers.filter((c) => {
          const k = c.data.current?.kind
          return k === "card" || k === "columnDrop"
        })
        const scoped = { ...args, droppableContainers: containers }
        const fromPointer = pointerWithin(scoped)
        if (fromPointer.length > 0) return fromPointer
        const fromRect = rectIntersection(scoped)
        if (fromRect.length > 0) return fromRect
        /**
         * 카드가 0개인 컬럼은 드롭 면적이 거의 없어 pointer/rect 충돌이 비는 경우가 많다.
         * 컬럼 드롭 존만 모아 포인터에 가장 가까운 컬럼을 고른다.
         */
        const columnDrops = containers.filter(
          (c) => c.data.current?.kind === "columnDrop",
        )
        if (columnDrops.length > 0) {
          return closestCenter({ ...args, droppableContainers: columnDrops })
        }
        return []
      }

      if (activeKind === "column") {
        const containers = args.droppableContainers.filter(
          (c) => c.data.current?.kind === "column",
        )
        if (containers.length > 0) {
          return closestCorners({ ...args, droppableContainers: containers })
        }
      }

      return closestCorners(args)
    },
    [],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const commitAndSync = useCallback(() => {
    void syncMutation.mutate(undefined, {
      onError: (e) => {
        console.error("[workspace-board] app-state sync failed", e)
      },
    })
  }, [syncMutation])

  const handleDragStart = useCallback(() => {
    overHintRef.current = null
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (!over) return
    const k = over.data.current?.kind as string | undefined
    let status: ItemStatus | undefined
    if (k === "columnDrop") status = over.data.current?.status as ItemStatus
    else if (k === "column" && isItemStatus(String(over.id)))
      status = over.id as ItemStatus
    else if (k === "card") status = over.data.current?.status as ItemStatus
    overHintRef.current = { kind: k, status, overId: String(over.id) }
  }, [])

  const handleDragCancel = useCallback(() => {
    overHintRef.current = null
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (dndDisabled) return
      const savedHint = overHintRef.current
      overHintRef.current = null

      const { active, over } = event
      const activeKind = active.data.current?.kind as string | undefined

      if (activeKind === "column") {
        if (!over || active.id === over.id) return
        if (over.data.current?.kind !== "column") return
        const oldIndex = columnOrder.indexOf(active.id as ItemStatus)
        const newIndex = columnOrder.indexOf(over.id as ItemStatus)
        if (oldIndex < 0 || newIndex < 0) return
        setWorkspaceColumnOrder(arrayMove(columnOrder, oldIndex, newIndex))
        commitAndSync()
        return
      }

      if (activeKind !== "card") return

      const itemId = String(active.id)
      const store = useAppStore.getState()
      const activeItem = store.getItemById(itemId)
      if (!activeItem) return
      if (activeItem.isLocked && activeItem.status !== "확정") return

      const sourceStatus = activeItem.status

      let targetStatus: ItemStatus | undefined
      let beforeCardId: string | null | undefined

      if (over && active.id !== over.id) {
        const ok = over.data.current?.kind as string | undefined
        if (ok === "columnDrop") {
          targetStatus = over.data.current?.status as ItemStatus
          beforeCardId = null
        } else if (ok === "column" && isItemStatus(String(over.id))) {
          targetStatus = over.id as ItemStatus
          beforeCardId = null
        } else if (ok === "card") {
          targetStatus = over.data.current?.status as ItemStatus
          beforeCardId = String(over.id)
        }
      }

      if (targetStatus === undefined && savedHint?.status) {
        targetStatus = savedHint.status
        beforeCardId =
          savedHint.kind === "card" ? savedHint.overId : null
      }

      /**
       * 드롭 순간 포인터가 다시 출발 컬럼(카드·컬럼 빈 영역) 위에 있으면 `over`만 보면
       * 같은 컬럼으로 오인됨. 직전 dragOver(savedHint)가 다른 컬럼이면 그쪽으로 이동 처리.
       * (예: 방향합의 → 확정)
       */
      if (
        targetStatus === sourceStatus &&
        savedHint?.status &&
        savedHint.status !== sourceStatus &&
        over &&
        active.id !== over.id
      ) {
        const ok = over.data.current?.kind as string | undefined
        let overStatus: ItemStatus | undefined
        if (ok === "columnDrop")
          overStatus = over.data.current?.status as ItemStatus
        else if (ok === "card")
          overStatus = over.data.current?.status as ItemStatus
        if (overStatus === sourceStatus) {
          targetStatus = savedHint.status
          beforeCardId =
            savedHint.kind === "card" ? savedHint.overId : null
        }
      }

      if (!targetStatus) return

      if (targetStatus === sourceStatus) {
        const columnItems = [...workspaceItems]
          .filter((i) => i.status === sourceStatus)
          .sort(sortItemsByBoardRank)
        const ids = columnItems.map((i) => i.id)

        let newVisibleOrder: string[] | null = null

        if (over?.data.current?.kind === "card" && String(over.id) !== itemId) {
          const overId = String(over.id)
          const oldIndex = ids.indexOf(itemId)
          const newIndex = ids.indexOf(overId)
          if (oldIndex < 0 || newIndex < 0) return
          newVisibleOrder = arrayMove(ids, oldIndex, newIndex)
        } else if (over?.data.current?.kind === "columnDrop") {
          const without = ids.filter((id) => id !== itemId)
          newVisibleOrder = [...without, itemId]
        } else if (
          !over &&
          savedHint?.status === sourceStatus &&
          savedHint.kind === "columnDrop"
        ) {
          const without = ids.filter((id) => id !== itemId)
          newVisibleOrder = [...without, itemId]
        } else if (
          !over &&
          savedHint?.status === sourceStatus &&
          savedHint.kind === "card" &&
          savedHint.overId !== itemId
        ) {
          const overId = savedHint.overId
          const oldIndex = ids.indexOf(itemId)
          const newIndex = ids.indexOf(overId)
          if (oldIndex >= 0 && newIndex >= 0) {
            newVisibleOrder = arrayMove(ids, oldIndex, newIndex)
          }
        }

        if (!newVisibleOrder) return

        const merged = mergeVisibleReorderIntoStatusOrder(
          store.items,
          sourceStatus,
          visibleIdSet,
          newVisibleOrder,
        )
        reorderWorkspaceItemsInStatus(sourceStatus, merged)
        commitAndSync()
        return
      }

      const targetPeers = store.items
        .filter((i) => i.status === targetStatus && i.id !== itemId)
        .sort(sortItemsByBoardRank)

      let targetIndex = targetPeers.length
      if (beforeCardId) {
        const ix = targetPeers.findIndex((i) => i.id === beforeCardId)
        if (ix >= 0) targetIndex = ix
      } else {
        let lastVisibleIx = -1
        for (let i = 0; i < targetPeers.length; i += 1) {
          if (visibleIdSet.has(targetPeers[i].id)) lastVisibleIx = i
        }
        targetIndex = lastVisibleIx + 1
      }

      moveWorkspaceCardToStatus(itemId, targetStatus, targetIndex)
      commitAndSync()
    },
    [
      columnOrder,
      commitAndSync,
      dndDisabled,
      moveWorkspaceCardToStatus,
      reorderWorkspaceItemsInStatus,
      setWorkspaceColumnOrder,
      visibleIdSet,
      workspaceItems,
    ],
  )

  return (
    <>
      {dndDisabled ? (
        <p className={styles.dndHint}>
          필터가 적용된 상태에서는 보드(컬럼·카드) 순서를 바꿀 수 없습니다. 필터를
          해제한 뒤 순서를 변경해 주세요.
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className={styles.board}
            style={{
              gridTemplateColumns: `repeat(${columnOrder.length}, minmax(0, 1fr))`,
            }}
          >
            {columnOrder.map((status) => {
              const columnItems = [...workspaceItems]
                .filter((item) => item.status === status)
                .sort(sortItemsByBoardRank)
              return (
                <WorkspaceStatusColumn
                  key={status}
                  status={status}
                  columnItems={columnItems}
                  dndDisabled={dndDisabled}
                  getDomainLabel={getDomainLabel}
                  onOpenItem={onOpenItem}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}
