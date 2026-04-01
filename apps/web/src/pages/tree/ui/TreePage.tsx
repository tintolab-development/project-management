import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import clsx from "clsx"
import { useAppStore } from "@/app/store/useAppStore"
import {
  buildDomainTree,
  getChildDomains,
  getDescendantDomainIds,
  getDomainItemCount,
  type DomainTreeNode,
} from "@/entities/domain/lib/domainTree"
import { normalizeKey } from "@/shared/lib/text"
import { itemMatchesSearch } from "@/shared/lib/itemSearch"
import { STATUS_LABELS, STATUS_STYLE } from "@/shared/constants/labels"

type DropPos = "before" | "after" | "inside" | null

export const TreePage = () => {
  const navigate = useNavigate()
  const domains = useAppStore((s) => s.domains)
  const items = useAppStore((s) => s.items)
  const treeQuery = useAppStore((s) => s.ui.treeQuery)
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

  const draggedItemIdRef = useRef("")
  const draggedDomainIdRef = useRef("")
  const [dropState, setDropState] = useState<{
    domainId: string
    pos: DropPos
  } | null>(null)
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
    setItemDropInsideId(null)
    setRootZoneActive(null)
  }

  const runDrop = (action: () => void) => {
    try {
      action()
    } catch (e) {
      console.error(e)
      window.alert("드래그앤드롭 처리 중 오류가 발생했습니다. 다시 시도해 주세요.")
    } finally {
      clearDragVisual()
    }
  }

  const handleDomainDragOver = (
    domainId: string,
    e: React.DragEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedItemIdRef.current) {
      e.currentTarget.classList.add("drag-over")
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
    e.currentTarget.classList.remove("drag-over")
    setDropState(null)
  }

  const handleDomainDrop = (domainId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("drag-over")
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
    runDrop(() => {
      const msg = applyDomainDrop(dragId, domainId, position)
      if (msg) window.alert(msg)
    })
  }

  const allCollapsed =
    !key && domains.every((domain) => !expandedIds.has(domain.id))

  return (
    <section className="panel item-tree-page" aria-label="아이템 트리">
      <div className="panel-head tree-panel-head">
        <div>
          <h3>Item Tree Explorer</h3>
          <div className="panel-sub">
            도메인과 아이템을 위계 구조로 펼쳐 보며, 최종확인값까지 빠르게
            확인합니다.
          </div>
        </div>
      </div>

      <div className="item-tree-toolbar">
        <div className="tree-toolbar-search">
          <input
            className="input"
            type="search"
            placeholder="이슈 검색"
            aria-label="트리에서 이슈 검색"
            value={treeQuery}
            onChange={(e) => setTreeQuery(e.target.value)}
          />
        </div>
        <div className="tree-toolbar-actions">
          <div className="tree-toolbar-create">
            <input
              id="newDomainInput"
              className="input"
              type="text"
              placeholder="도메인(트리) 추가"
              aria-label="새 도메인 이름"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                const input = e.currentTarget
                createDomain(input.value)
                input.value = ""
              }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                const input = document.getElementById(
                  "newDomainInput",
                ) as HTMLInputElement | null
                if (!input) return
                createDomain(input.value)
                input.value = ""
              }}
            >
              추가
            </button>
          </div>
        </div>
      </div>

      <div className="tree-master-bar">
        <div className="tree-master-summary">
          <div className="tree-master-title">전체 트리</div>
          <div className="tree-master-count">
            도메인 {domains.length}개 · 아이템 {items.length}개
          </div>
        </div>
        <div className="tree-master-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setTreeExpandAll(false)}
          >
            전체 접기
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setTreeExpandAll(true)}
          >
            전체 펼치기
          </button>
        </div>
      </div>

      <div className="tree-explorer-helpbar">
        도메인 접기/펼치기 · 도메인 드래그 정렬/중첩 · 하위 도메인 생성 · 상세보기로
        최종확인값 확인
      </div>

      <div
        className={clsx("tree-outline", allCollapsed && "all-collapsed")}
        role="tree"
        aria-label="도메인 및 아이템 트리"
      >
        <div
          className={clsx("tree-root-dropzone", rootZoneActive === "start" && "active")}
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
            runDrop(() => {
              const msg = moveDomainNode(dragId, "", 0)
              if (msg) window.alert(msg)
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
            itemDropInsideId={itemDropInsideId}
            onToggleDomain={toggleDomainExpanded}
            onPreviewItem={toggleTreeItemPreview}
            onGoItem={() => navigate("/items")}
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
              runDrop(() => {
                const insertAt = getChildDomains(domains, itemDomainId).filter(
                  (d) => d.id !== dragId,
                ).length
                const msg = moveDomainNode(dragId, itemDomainId, insertAt)
                if (msg) window.alert(msg)
              })
            }}
            domains={domains}
            items={items}
            applyDomainDrop={applyDomainDrop}
            clearDragVisual={clearDragVisual}
            runDrop={runDrop}
          />
        ))}
        <div
          className={clsx("tree-root-dropzone", rootZoneActive === "end" && "active")}
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
            runDrop(() => {
              const msg = moveDomainNode(
                dragId,
                "",
                roots.filter((r) => r.id !== dragId).length,
              )
              if (msg) window.alert(msg)
            })
          }}
        />
      </div>
    </section>
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
  clearDragVisual: () => void
  runDrop: (fn: () => void) => void
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
          draggable
          onDragStart={(e) => {
            draggedItemIdRef.current = item.id
            draggedDomainIdRef.current = ""
            e.currentTarget.classList.add("dragging")
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("application/x-tdw-item", item.id)
          }}
          onDragEnd={(e) => {
            e.currentTarget.classList.remove("dragging")
            clearDragVisual()
          }}
          onDragOver={(e) => onItemRowDragOver(item.domain, e)}
          onDragLeave={onItemRowDragLeave}
          onDrop={(e) => onItemRowDrop(item.domain, e)}
        >
          <div className="tree-item-main">
            <div className="tree-item-code">{item.code}</div>
            <div className="tree-item-meta">
              <div className="tree-item-title">{item.title}</div>
              <span
                className={clsx(
                  "pill",
                  STATUS_STYLE[item.status] || "dark",
                )}
              >
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          </div>
          <div className="tree-item-actions">
            <button
              type="button"
              className="tree-inline-btn"
              onClick={() => onPreviewItem(item.id)}
            >
              {isPreviewOpen ? "닫기" : "상세보기"}
            </button>
            <button
              type="button"
              className="tree-item-delete"
              title="아이템 삭제"
              aria-label={`${item.code} 삭제`}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteItem(item.id)
              }}
            >
              ×
            </button>
          </div>
        </div>
        {isPreviewOpen ? (
          <div className="tree-item-preview">
            <div className="tree-preview-label">최종확인값</div>
            <div
              className={clsx(
                "tree-preview-value",
                !finalValue && "tree-preview-empty",
              )}
            >
              {finalValue || "아직 최종 확인값이 입력되지 않았습니다."}
            </div>
            <div className="tree-preview-actions">
              <button
                type="button"
                className="tree-inline-btn"
                onClick={() => {
                  onSelectItem(item.id)
                  onGoItem()
                }}
              >
                더보기
              </button>
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
      <div className="tree-empty">아이템이 없습니다.</div>
    )

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
          e.currentTarget.classList.add("active")
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          e.currentTarget.classList.remove("active")
        }}
        onDrop={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          e.currentTarget.classList.remove("active")
          runDrop(() => {
            const dragId = draggedDomainIdRef.current
            const msg = applyDomainDrop(dragId, node.domain.id, "before")
            if (msg) window.alert(msg)
          })
        }}
      />
      <div
        className={headClass}
        draggable
        onDragStart={(e) => {
          draggedDomainIdRef.current = node.domain.id
          draggedItemIdRef.current = ""
          e.currentTarget.classList.add("dragging")
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData("application/x-tdw-domain", node.domain.id)
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("dragging")
          clearDragVisual()
        }}
        onDragOver={(e) => onDomainDragOver(node.domain.id, e)}
        onDragLeave={onDomainDragLeave}
        onDrop={(e) => onDomainDrop(node.domain.id, e)}
      >
        <button
          type="button"
          className="tree-toggle"
          aria-expanded={isOpen}
          aria-label={isOpen ? "접기" : "펼치기"}
          onClick={() => onToggleDomain(node.domain.id)}
        >
          {isOpen ? "▾" : "▸"}
        </button>
        <div className="tree-domain-main">
          <button
            type="button"
            className="tree-domain-link"
            onClick={() => onToggleDomain(node.domain.id)}
          >
            {node.domain.name}
          </button>
          <span className="tree-count">{countLabel}</span>
        </div>
        <div className="tree-domain-actions">
          <button
            type="button"
            className="tree-inline-btn"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild(node.domain.id)
            }}
          >
            하위 추가
          </button>
          <button
            type="button"
            className="tree-inline-btn"
            onClick={(e) => {
              e.stopPropagation()
              onRenameDomain(node.domain.id)
            }}
          >
            이름변경
          </button>
          <button
            type="button"
            className="tree-item-delete tree-domain-delete"
            title="도메인 삭제"
            aria-label={`${node.domain.name} 도메인 삭제`}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteDomain(node.domain.id)
            }}
          >
            ×
          </button>
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
          e.currentTarget.classList.add("active")
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          e.currentTarget.classList.remove("active")
        }}
        onDrop={(e) => {
          if (!draggedDomainIdRef.current) return
          e.preventDefault()
          e.stopPropagation()
          e.currentTarget.classList.remove("active")
          runDrop(() => {
            const dragId = draggedDomainIdRef.current
            const msg = applyDomainDrop(dragId, node.domain.id, "after")
            if (msg) window.alert(msg)
          })
        }}
      />
    </div>
  )
}
