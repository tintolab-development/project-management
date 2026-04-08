import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import clsx from "clsx"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import { useAppStore } from "@/app/store/useAppStore"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import {
  buildDomainTree,
  getChildDomains,
  getDescendantDomainIds,
  getDomainItemCount,
  type DomainTreeNode,
} from "@/entities/domain/lib/domainTree"
import { normalizeKey } from "@/shared/lib/text"
import { itemMatchesSearch } from "@/shared/lib/itemSearch"
import { STATUS_LABELS, statusToPillTone } from "@/shared/constants/labels"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/shared/ui/button"
import { Pill } from "@/shared/ui/pill"
import { panelHeadStyles } from "@/shared/ui/page-chrome"
import { cn } from "@/lib/utils"

import "./tree-explorer.css"
import { Heading, Text, textVariants } from "@/shared/ui/typography"
import { Card } from "@/shared/ui/card"
import { appAlert } from "@/shared/lib/appDialog"

type DropPos = "before" | "after" | "inside" | null

/** 트리 검색: 스토어 반영 지연 — 필터·트리 재계산 부하 완화 */
const TREE_SEARCH_DEBOUNCE_MS = 300

export const TreePage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()
  const domains = useAppStore((s) => s.domains)
  const items = useAppStore((s) => s.items)
  const treeQuery = useAppStore((s) => s.ui.treeQuery)
  const [searchDraft, setSearchDraft] = useState(
    () => useAppStore.getState().ui.treeQuery,
  )
  const searchDebounceBootRef = useRef(true)
  const expandedDomainIds = useAppStore((s) => s.ui.expandedDomainIds)
  const selectedItemId = useAppStore((s) => s.ui.selectedItemId)
  const treePreviewItemId = useAppStore((s) => s.ui.treePreviewItemId)

  const setTreeQuery = useAppStore((s) => s.setTreeQuery)
  const createDomain = useAppStore((s) => s.createDomain)
  const setTreeExpandAll = useAppStore((s) => s.setTreeExpandAll)
  const toggleDomainExpanded = useAppStore((s) => s.toggleDomainExpanded)
  const toggleTreeItemPreview = useAppStore((s) => s.toggleTreeItemPreview)
  const selectItem = useAppStore((s) => s.selectItem)
  const deleteItem = useAppStore((s) => s.deleteItem)
  const moveItemToDomain = useAppStore((s) => s.moveItemToDomain)
  const moveDomainNode = useAppStore((s) => s.moveDomainNode)
  const applyDomainDrop = useAppStore((s) => s.applyDomainDrop)
  const createChildDomain = useAppStore((s) => s.createChildDomain)
  const renameDomain = useAppStore((s) => s.renameDomain)
  const deleteDomainNode = useAppStore((s) => s.deleteDomainNode)

  useEffect(() => {
    setTreeExpandAll(false)
  }, [setTreeExpandAll])

  useEffect(() => {
    if (searchDebounceBootRef.current) {
      searchDebounceBootRef.current = false
      return
    }
    const id = window.setTimeout(() => {
      setTreeQuery(searchDraft)
    }, TREE_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchDraft, setTreeQuery])

  useEffect(() => {
    return () => {
      setTreeQuery("")
    }
  }, [setTreeQuery])

  const newDomainInputRef = useRef<HTMLInputElement>(null)
  const draggedItemIdRef = useRef("")
  const draggedDomainIdRef = useRef("")
  const [dropState, setDropState] = useState<{
    domainId: string
    pos: DropPos
  } | null>(null)
  const [itemDragOverDomainId, setItemDragOverDomainId] = useState<
    string | null
  >(null)
  const [draggingItemRowId, setDraggingItemRowId] = useState<string | null>(
    null,
  )
  const [draggingDomainHeadId, setDraggingDomainHeadId] = useState<
    string | null
  >(null)
  const [itemDropInsideId, setItemDropInsideId] = useState<string | null>(null)
  const [rootZoneActive, setRootZoneActive] = useState<"start" | "end" | null>(
    null,
  )

  const key = normalizeKey(treeQuery)
  const expandedIds = useMemo(
    () => new Set(expandedDomainIds),
    [expandedDomainIds],
  )

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.id, d])),
    [domains],
  )
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const shouldShowItem = (item: (typeof items)[0]) =>
    !key || itemMatchesSearch(item, treeQuery, getDomainLabel)

  const shouldShowDomainNode = (node: DomainTreeNode): boolean => {
    const domainMatch = key && normalizeKey(node.domain.name).includes(key)
    return (
      !key ||
      domainMatch ||
      node.items.some(shouldShowItem) ||
      node.children.some(shouldShowDomainNode)
    )
  }

  const treeRoots = useMemo(
    () => buildDomainTree(domains, items, ""),
    [domains, items],
  )

  const clearDragVisual = () => {
    draggedItemIdRef.current = ""
    draggedDomainIdRef.current = ""
    setDropState(null)
    setItemDragOverDomainId(null)
    setDraggingItemRowId(null)
    setDraggingDomainHeadId(null)
    setItemDropInsideId(null)
    setRootZoneActive(null)
  }

  const runDrop = (action: () => void | Promise<void>) => {
    void (async () => {
      try {
        await action()
      } catch (e) {
        console.error(e)
        await appAlert(
          "드래그앤드롭 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
        )
      } finally {
        clearDragVisual()
      }
    })()
  }

  const submitNewDomain = async () => {
    const input = newDomainInputRef.current
    if (!input) return
    await createDomain(input.value)
    input.value = ""
  }

  const handleDomainDragOver = (
    domainId: string,
    e: React.DragEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedItemIdRef.current) {
      setItemDragOverDomainId(domainId)
      return
    }
    if (!draggedDomainIdRef.current) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / Math.max(rect.height, 1)
    const pos: DropPos =
      ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside"
    setDropState({ domainId, pos })
  }

  const handleDomainDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setItemDragOverDomainId(null)
    setDropState(null)
  }

  const handleDomainDrop = (domainId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setItemDragOverDomainId(null)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / Math.max(rect.height, 1)
    const position: "before" | "after" | "inside" =
      ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside"

    if (draggedItemIdRef.current) {
      const itemId = draggedItemIdRef.current
      runDrop(() => moveItemToDomain(itemId, domainId))
      return
    }
    if (!draggedDomainIdRef.current) return
    const dragId = draggedDomainIdRef.current
    runDrop(async () => {
      const msg = applyDomainDrop(dragId, domainId, position)
      if (msg) await appAlert(msg)
    })
  }

  const allCollapsed =
    !key && domains.every((domain) => !expandedIds.has(domain.id))

  return (
    <Card variant="panel" className="item-tree-page" aria-label="아이템 트리">
      <div className={clsx(panelHeadStyles.panelHead, "tree-panel-head")}>
        <div>
          <Heading as="h3" variant="panel">
            Item Tree Explorer
          </Heading>
          <Text as="div" variant="panelSub">
            도메인과 아이템을 위계 구조로 펼쳐 보며, 최종확인값까지 빠르게
            확인합니다.
          </Text>
        </div>
      </div>

      <div className="item-tree-toolbar">
        <div className="tree-toolbar-search">
          <Input
            type="search"
            placeholder="이슈 검색"
            aria-label="트리에서 이슈 검색"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
        </div>
        <div className="tree-toolbar-actions">
          <div className="tree-toolbar-create">
            <Input
              ref={newDomainInputRef}
              type="text"
              placeholder="도메인(트리) 추가"
              aria-label="새 도메인 이름"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                submitNewDomain()
              }}
            />
            <Button
              type="button"
              appearance="outline"
              dimension="hug"
              onClick={submitNewDomain}
            >
              추가
            </Button>
          </div>
        </div>
      </div>

      <div className="tree-master-bar">
        <div className="tree-master-summary">
          <Text as="div" variant="treeMasterTitle">
            전체 트리
          </Text>
          <Text as="div" variant="treeMasterCount">
            도메인 {domains.length}개 · 아이템 {items.length}개
          </Text>
        </div>
        <div className="tree-master-actions">
          <Button
            type="button"
            appearance="outline"
            dimension="hug"
            onClick={() => setTreeExpandAll(false)}
          >
            전체 접기
          </Button>
          <Button
            type="button"
            appearance="outline"
            dimension="hug"
            onClick={() => setTreeExpandAll(true)}
          >
            전체 펼치기
          </Button>
        </div>
      </div>

      <Text as="div" variant="treeHelpBar">
        도메인 접기/펼치기 · 도메인 드래그 정렬/중첩 · 하위 도메인 생성 · 상세보기로
        최종확인값 확인
      </Text>

      <div
        className={clsx("tree-outline", allCollapsed && "all-collapsed")}
        role="tree"
        aria-label="도메인 및 아이템 트리"
      >
        <div
          className="tree-root-dropzone"
          data-drop-active={rootZoneActive === "start" ? "" : undefined}
          onDragOver={(e) => {
            if (!draggedDomainIdRef.current) return
            e.preventDefault()
            setRootZoneActive("start")
          }}
          onDragLeave={() => setRootZoneActive(null)}
          onDrop={(e) => {
            if (!draggedDomainIdRef.current) return
            e.preventDefault()
            const dragId = draggedDomainIdRef.current
            runDrop(async () => {
              const msg = moveDomainNode(dragId, "", 0)
              if (msg) await appAlert(msg)
            })
          }}
        />
        {treeRoots.map((node) => (
          <TreeDomainBranch
            key={node.domain.id}
            node={node}
            depth={0}
            keyQuery={key}
            expandedIds={expandedIds}
            shouldShowDomainNode={shouldShowDomainNode}
            shouldShowItem={shouldShowItem}
            selectedItemId={selectedItemId}
            treePreviewItemId={treePreviewItemId}
            dropState={dropState}
            itemDragOverDomainId={itemDragOverDomainId}
            draggingDomainHeadId={draggingDomainHeadId}
            draggingItemRowId={draggingItemRowId}
            itemDropInsideId={itemDropInsideId}
            onToggleDomain={toggleDomainExpanded}
            onPreviewItem={toggleTreeItemPreview}
            onGoItem={() => navigate(paths.tasks)}
            onSelectItem={selectItem}
            onDeleteItem={deleteItem}
            onAddChild={createChildDomain}
            onRenameDomain={renameDomain}
            onDeleteDomain={deleteDomainNode}
            draggedItemIdRef={draggedItemIdRef}
            draggedDomainIdRef={draggedDomainIdRef}
            onDomainDragOver={handleDomainDragOver}
            onDomainDragLeave={handleDomainDragLeave}
            onDomainDrop={handleDomainDrop}
            onItemRowDragOver={(itemDomainId, e) => {
              if (!draggedDomainIdRef.current) return
              e.preventDefault()
              e.stopPropagation()
              setItemDropInsideId(itemDomainId)
            }}
            onItemRowDragLeave={(e) => {
              e.stopPropagation()
              setItemDropInsideId(null)
            }}
            onItemRowDrop={(itemDomainId, e) => {
              if (!draggedDomainIdRef.current) return
              e.preventDefault()
              e.stopPropagation()
              setItemDropInsideId(null)
              const dragId = draggedDomainIdRef.current
              runDrop(async () => {
                const insertAt = getChildDomains(domains, itemDomainId).filter(
                  (d) => d.id !== dragId,
                ).length
                const msg = moveDomainNode(dragId, itemDomainId, insertAt)
                if (msg) await appAlert(msg)
              })
            }}
            onItemDragStart={(itemId) => {
              setDraggingItemRowId(itemId)
            }}
            onItemDragEnd={() => {
              setDraggingItemRowId(null)
            }}
            onDomainHeadDragStart={(domainId) => {
              setDraggingDomainHeadId(domainId)
            }}
            onDomainHeadDragEnd={() => {
              setDraggingDomainHeadId(null)
            }}
            domains={domains}
            items={items}
            applyDomainDrop={applyDomainDrop}
            clearDragVisual={clearDragVisual}
            runDrop={runDrop}
          />
        ))}
        <div
          className="tree-root-dropzone"
          data-drop-active={rootZoneActive === "end" ? "" : undefined}
          onDragOver={(e) => {
            if (!draggedDomainIdRef.current) return
            e.preventDefault()
            setRootZoneActive("end")
          }}
          onDragLeave={() => setRootZoneActive(null)}
          onDrop={(e) => {
            if (!draggedDomainIdRef.current) return
            e.preventDefault()
            const dragId = draggedDomainIdRef.current
            const roots = domains.filter((d) => !(d.parentId || ""))
            runDrop(async () => {
              const msg = moveDomainNode(
                dragId,
                "",
                roots.filter((r) => r.id !== dragId).length,
              )
              if (msg) await appAlert(msg)
            })
          }}
        />
      </div>
    </Card>
  )
}

type BranchProps = {
  node: DomainTreeNode
  depth: number
  keyQuery: string
  expandedIds: Set<string>
  shouldShowDomainNode: (n: DomainTreeNode) => boolean
  shouldShowItem: (item: import("@/entities/item/model/types").Item) => boolean
  selectedItemId: string | null
  treePreviewItemId: string
  dropState: { domainId: string; pos: DropPos } | null
  itemDragOverDomainId: string | null
  draggingDomainHeadId: string | null
  draggingItemRowId: string | null
  itemDropInsideId: string | null
  onToggleDomain: (id: string) => void
  onPreviewItem: (id: string) => void
  onGoItem: () => void
  onSelectItem: (id: string | null) => void
  onDeleteItem: (id: string) => void
  onAddChild: (parentId: string) => void
  onRenameDomain: (id: string) => void
  onDeleteDomain: (id: string) => void
  draggedItemIdRef: React.MutableRefObject<string>
  draggedDomainIdRef: React.MutableRefObject<string>
  onDomainDragOver: (domainId: string, e: React.DragEvent) => void
  onDomainDragLeave: (e: React.DragEvent) => void
  onDomainDrop: (domainId: string, e: React.DragEvent) => void
  onItemRowDragOver: (itemDomainId: string, e: React.DragEvent) => void
  onItemRowDragLeave: (e: React.DragEvent) => void
  onItemRowDrop: (itemDomainId: string, e: React.DragEvent) => void
  onItemDragStart: (itemId: string) => void
  onItemDragEnd: () => void
  onDomainHeadDragStart: (domainId: string) => void
  onDomainHeadDragEnd: () => void
  clearDragVisual: () => void
  runDrop: (fn: () => void | Promise<void>) => void
  domains: import("@/entities/domain/model/types").Domain[]
  items: import("@/entities/item/model/types").Item[]
  applyDomainDrop: (
    dragId: string,
    targetId: string,
    pos: "before" | "after" | "inside",
  ) => string | undefined
}

const TreeDomainBranch = ({
  node,
  depth,
  keyQuery,
  expandedIds,
  shouldShowDomainNode,
  shouldShowItem,
  selectedItemId,
  treePreviewItemId,
  dropState,
  itemDragOverDomainId,
  draggingDomainHeadId,
  draggingItemRowId,
  itemDropInsideId,
  onToggleDomain,
  onPreviewItem,
  onGoItem,
  onSelectItem,
  onDeleteItem,
  onAddChild,
  onRenameDomain,
  onDeleteDomain,
  draggedItemIdRef,
  draggedDomainIdRef,
  onDomainDragOver,
  onDomainDragLeave,
  onDomainDrop,
  onItemRowDragOver,
  onItemRowDragLeave,
  onItemRowDrop,
  onItemDragStart,
  onItemDragEnd,
  onDomainHeadDragStart,
  onDomainHeadDragEnd,
  clearDragVisual,
  runDrop,
  domains,
  items,
  applyDomainDrop,
}: BranchProps) => {
  if (!shouldShowDomainNode(node)) return null

  const isOpen = keyQuery ? true : expandedIds.has(node.domain.id)
  const descCount = getDescendantDomainIds(domains, node.domain.id).length
  const subtreeItemCount = getDomainItemCount(
    domains,
    node.domain.id,
    items,
    { includeDescendants: true },
  )
  const countLabel = `${descCount ? `하위 ${descCount} · ` : ""}아이템 ${subtreeItemCount}`

  const headClass = clsx(
    "tree-outline-head",
    dropState?.domainId === node.domain.id && dropState.pos === "before" && "drop-before",
    dropState?.domainId === node.domain.id && dropState.pos === "inside" && "drop-inside",
    dropState?.domainId === node.domain.id && dropState.pos === "after" && "drop-after",
  )

  const childHtml =
    node.children.map((child) => (
      <TreeDomainBranch
        key={child.domain.id}
        node={child}
        depth={depth + 1}
        keyQuery={keyQuery}
        expandedIds={expandedIds}
        shouldShowDomainNode={shouldShowDomainNode}
        shouldShowItem={shouldShowItem}
        selectedItemId={selectedItemId}
        treePreviewItemId={treePreviewItemId}
        dropState={dropState}
        itemDragOverDomainId={itemDragOverDomainId}
        draggingDomainHeadId={draggingDomainHeadId}
        draggingItemRowId={draggingItemRowId}
        itemDropInsideId={itemDropInsideId}
        onToggleDomain={onToggleDomain}
        onPreviewItem={onPreviewItem}
        onGoItem={onGoItem}
        onSelectItem={onSelectItem}
        onDeleteItem={onDeleteItem}
        onAddChild={onAddChild}
        onRenameDomain={onRenameDomain}
        onDeleteDomain={onDeleteDomain}
        draggedItemIdRef={draggedItemIdRef}
        draggedDomainIdRef={draggedDomainIdRef}
        onDomainDragOver={onDomainDragOver}
        onDomainDragLeave={onDomainDragLeave}
        onDomainDrop={onDomainDrop}
        onItemRowDragOver={onItemRowDragOver}
        onItemRowDragLeave={onItemRowDragLeave}
        onItemRowDrop={onItemRowDrop}
        onItemDragStart={onItemDragStart}
        onItemDragEnd={onItemDragEnd}
        onDomainHeadDragStart={onDomainHeadDragStart}
        onDomainHeadDragEnd={onDomainHeadDragEnd}
        domains={domains}
        items={items}
        applyDomainDrop={applyDomainDrop}
        clearDragVisual={clearDragVisual}
        runDrop={runDrop}
      />
    )) || []

  const itemHtml = node.items.filter(shouldShowItem).map((item) => {
    const isPreviewOpen = treePreviewItemId === item.id
    const finalValue = item.finalConfirmedValue?.trim() || ""
    return (
      <div
        key={item.id}
        className="tree-outline-item"
        style={{ "--tree-depth": depth + 1 } as React.CSSProperties}
      >
        <div
          className={clsx(
            "tree-item-row",
            item.id === selectedItemId && "active",
            itemDropInsideId === item.domain && "drop-inside",
          )}
          data-dragging={draggingItemRowId === item.id ? "" : undefined}
          draggable
          onDragStart={(e) => {
            draggedItemIdRef.current = item.id
            draggedDomainIdRef.current = ""
            onItemDragStart(item.id)
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("application/x-tdw-item", item.id)
          }}
          onDragEnd={() => {
            onItemDragEnd()
            clearDragVisual()
          }}
          onDragOver={(e) => onItemRowDragOver(item.domain, e)}
          onDragLeave={onItemRowDragLeave}
          onDrop={(e) => onItemRowDrop(item.domain, e)}
        >
          <div className="tree-item-main">
            <Text as="div" variant="treeCode">
              {item.code}
            </Text>
            <div className="tree-item-meta">
              <Text
                as="div"
                variant="treeTitle"
                className="tree-item-title-truncate"
              >
                {item.title}
              </Text>
              <Pill tone={statusToPillTone(item.status)}>
                {STATUS_LABELS[item.status]}
              </Pill>
            </div>
          </div>
          <div className="tree-item-actions">
            <Button
              type="button"
              appearance="outline"
              dimension="treeInline"
              onClick={() => onPreviewItem(item.id)}
            >
              {isPreviewOpen ? "닫기" : "상세보기"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="tree-icon-danger"
              title="아이템 삭제"
              aria-label={`${item.code} 삭제`}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteItem(item.id)
              }}
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
        {isPreviewOpen ? (
          <div className="tree-item-preview">
            <Text as="div" variant="treePreviewLabel">
              최종확인값
            </Text>
            <Text
              as="div"
              variant={
                finalValue ? "treePreviewValue" : "treePreviewPlaceholder"
              }
            >
              {finalValue || "아직 최종 확인값이 입력되지 않았습니다."}
            </Text>
            <div className="tree-preview-actions">
              <Button
                type="button"
                appearance="outline"
                dimension="treeInline"
                onClick={() => {
                  onSelectItem(item.id)
                  onGoItem()
                }}
              >
                더보기
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    )
  })

  const bodyContent =
    childHtml.length || itemHtml.length ? (
      <>
        {childHtml}
        {itemHtml}
      </>
    ) : (
      <Text as="div" variant="treeEmpty">
        아이템이 없습니다.
      </Text>
    )

  const setDropzoneActive = (el: EventTarget | null, active: boolean) => {
    const zone = el as HTMLElement | null
    if (!zone) return
    if (active) zone.dataset.dropActive = ""
    else delete zone.dataset.dropActive
  }

  return (
    <div
      className="tree-domain-node"
      style={{ "--tree-depth": depth } as React.CSSProperties}
    >
      <div
        className="tree-domain-dropzone"
        onDragOver={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, true)
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, false)
        }}
        onDrop={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, false)
          runDrop(async () => {
            const dragId = draggedDomainIdRef.current
            const msg = applyDomainDrop(dragId, node.domain.id, "before")
            if (msg) await appAlert(msg)
          })
        }}
      />
      <div
        className={headClass}
        data-item-drag-over={
          itemDragOverDomainId === node.domain.id ? "" : undefined
        }
        data-dragging={
          draggingDomainHeadId === node.domain.id ? "" : undefined
        }
        draggable
        onDragStart={(e) => {
          draggedDomainIdRef.current = node.domain.id
          draggedItemIdRef.current = ""
          onDomainHeadDragStart(node.domain.id)
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData("application/x-tdw-domain", node.domain.id)
        }}
        onDragEnd={() => {
          onDomainHeadDragEnd()
          clearDragVisual()
        }}
        onDragOver={(e) => onDomainDragOver(node.domain.id, e)}
        onDragLeave={onDomainDragLeave}
        onDrop={(e) => onDomainDrop(node.domain.id, e)}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="tree-toggle shrink-0"
          aria-expanded={isOpen}
          aria-label={isOpen ? "접기" : "펼치기"}
          onClick={() => onToggleDomain(node.domain.id)}
        >
          {isOpen ? (
            <ChevronDown className="size-4" aria-hidden />
          ) : (
            <ChevronRight className="size-4" aria-hidden />
          )}
        </Button>
        <div className="tree-domain-main">
          <Button
            type="button"
            variant="ghost"
            className={clsx(
              "tree-domain-link h-auto min-h-0 min-w-0 justify-start px-1 py-0.5 font-bold",
              textVariants({ variant: "treeDomainButton" }),
            )}
            onClick={() => onToggleDomain(node.domain.id)}
          >
            {node.domain.name}
          </Button>
          <Badge
            variant="outline"
            className={cn(
              "tree-count-badge max-w-full min-w-0 shrink font-normal text-muted-foreground",
            )}
          >
            {countLabel}
          </Badge>
        </div>
        <div className="tree-domain-actions">
          <Button
            type="button"
            appearance="outline"
            dimension="treeInline"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild(node.domain.id)
            }}
          >
            하위 추가
          </Button>
          <Button
            type="button"
            appearance="outline"
            dimension="treeInline"
            onClick={(e) => {
              e.stopPropagation()
              onRenameDomain(node.domain.id)
            }}
          >
            이름변경
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="tree-icon-danger tree-domain-delete"
            title="도메인 삭제"
            aria-label={`${node.domain.name} 도메인 삭제`}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteDomain(node.domain.id)
            }}
          >
            <X className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      {isOpen ? (
        <div className="tree-outline-body">{bodyContent}</div>
      ) : null}
      <div
        className="tree-domain-dropzone"
        onDragOver={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, true)
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, false)
        }}
        onDrop={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          setDropzoneActive(e.currentTarget, false)
          runDrop(async () => {
            const dragId = draggedDomainIdRef.current
            const msg = applyDomainDrop(dragId, node.domain.id, "after")
            if (msg) await appAlert(msg)
          })
        }}
      />
    </div>
  )
}
