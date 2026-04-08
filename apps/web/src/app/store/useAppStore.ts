import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { normalizeAppState } from "@/entities/app-state/lib/normalizeAppState"
import { createSeedData } from "@/entities/app-state/model/seed"
import type { AppState, UiState } from "@/entities/app-state/model/types"
import type { Comment } from "@/entities/comment/model/types"
import type { Item, ItemType } from "@/entities/item/model/types"
import type { Domain } from "@/entities/domain/model/types"
import { findDomainByAny } from "@/entities/domain/lib/findDomain"
import {
  getChildDomains,
  getDomainMap,
  getDomainPathLabel,
  getFallbackDomainId,
  normalizeDomainOrders,
  walkDomainsFlat,
} from "@/entities/domain/lib/domainTree"
import { moveDomainNodeInState, applyDomainDropPositionInState } from "@/entities/domain/lib/moveDomain"
import { resolveDomainValue } from "@/entities/domain/lib/ensureDomain"
import { uniqueId } from "@/shared/lib/ids"
import { normalizeKey, normalizeTextValue } from "@/shared/lib/text"
import { normalizeStatusValue } from "@/shared/lib/status"
import { STORAGE_KEY } from "@/shared/config/storage"
import type { ImportRowResult } from "@/features/bulk-import/lib/prepareImport"
import { normalizeItemType } from "@/shared/lib/itemType"
import type { ItemStatus } from "@/shared/constants/labels"
import {
  sortItemsByBoardRank,
  sortItemsForGlobalList,
} from "@/entities/item/lib/sortItemsByBoard"
import { getNextItemCode } from "@/entities/item/lib/nextItemCode"
import { useAuthSessionStore } from "@/features/auth"
import { appAlert, appConfirm, appPrompt } from "@/shared/lib/appDialog"

const nowIso = () => new Date().toISOString()

const resolveHistoryActor = () =>
  useAuthSessionStore.getState().user?.displayName?.trim() || "틴토랩 사용자"

const nextBoardRankForStatus = (
  items: Item[],
  status: ItemStatus,
  excludeItemId?: string,
) => {
  const ranks = items
    .filter((i) => i.status === status && i.id !== excludeItemId)
    .map((i) => i.boardRank)
  return ranks.length ? Math.max(...ranks) + 1 : 0
}

export type CreateItemInput = {
  type: ItemType
  domain: string
  priority: Item["priority"]
  owner: string
  dueDate: string
  title: string
  description: string
  /** 미지정 시 `논의` */
  status?: string
  clientResponse?: string
  finalConfirmedValue?: string
  /** 태스크 생성 화면에서 저장 시 함께 반영할 초안 코멘트 */
  initialComments?: ReadonlyArray<{
    author: string
    body: string
    createdAt: string
  }>
}

export type ItemDetailPatch = {
  type: ItemType
  title: string
  domain: string
  priority: Item["priority"]
  status: string
  owner: string
  dueDate: string
  description: string
  clientResponse: string
  finalConfirmedValue: string
}

export type TasksListFiltersPayload = {
  itemsQuery: string
  priorityFilters: Item["priority"][]
  typeFilters: ItemType[]
  domainFilter: string
  ownerFilter: string
}

export type AppStore = AppState & {
  getSortedItems: () => Item[]
  getItemById: (id: string) => Item | undefined
  hydrateFromParsedJson: (data: unknown) => void
  setActiveWorkspace: (w: UiState["activeWorkspace"]) => void
  setItemsQuery: (q: string) => void
  setTreeQuery: (q: string) => void
  setDomainFilter: (v: string) => void
  setStatusFilter: (v: string) => void
  setDueDateFilter: (v: string) => void
  /** Tasks 좌측 패널 조회 — 검색·배지·분류·담당자 일괄 반영, 상태·마감 필터는 초기화 */
  applyTasksListFilters: (p: TasksListFiltersPayload) => void
  selectItem: (id: string | null) => void
  toggleDomainExpanded: (domainId: string) => void
  setTreeExpandAll: (expand: boolean) => void
  toggleTreeItemPreview: (itemId: string) => void
  saveSelectedItem: (patch: ItemDetailPatch) => Promise<boolean>
  toggleLockSelectedItem: () => Promise<boolean>
  addComment: (author: string, body: string) => Promise<boolean>
  /** MSW/백엔드가 부여한 `id`·`createdAt`으로 코멘트를 반영할 때 사용 */
  addCommentFromApi: (comment: Comment) => Promise<boolean>
  deleteItem: (itemId: string) => Promise<void>
  moveItemToDomain: (itemId: string, targetDomainId: string) => void
  moveDomainNode: (
    dragDomainId: string,
    parentId: string,
    insertIndex: number,
  ) => string | undefined
  applyDomainDrop: (
    dragDomainId: string,
    targetDomainId: string,
    position: "before" | "after" | "inside",
  ) => string | undefined
  createItem: (input: CreateItemInput) => Promise<string | undefined>
  createDomain: (name: string, parentId?: string) => Promise<Domain | null>
  createChildDomain: (parentDomainId: string) => Promise<void>
  renameDomain: (domainId: string) => Promise<void>
  deleteDomainNode: (domainId: string) => Promise<void>
  executeBulkImport: (rows: ImportRowResult[]) => Promise<void>
  exportStateJson: () => string
  resetToSample: () => Promise<void>
  setWorkspaceColumnOrder: (order: ItemStatus[]) => void
  reorderWorkspaceItemsInStatus: (status: ItemStatus, orderedIds: string[]) => void
  /** 다른 상태 컬럼으로 카드 이동(보드 DnD). 확정→다른 상태는 허용(잠금 해제). 비확정+잠금만 무시. */
  moveWorkspaceCardToStatus: (
    itemId: string,
    targetStatus: ItemStatus,
    targetIndex: number,
  ) => void
}

const addHistory = (
  history: AppState["history"],
  itemId: string,
  eventType: string,
  summary: string,
  actor = "시스템",
  createdAtIso?: string,
) => {
  history.unshift({
    id: uniqueId("H"),
    itemId,
    eventType,
    summary,
    actor,
    createdAt: createdAtIso ?? nowIso(),
  })
}

const initial = normalizeAppState(createSeedData())

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initial,

      getSortedItems: () => sortItemsForGlobalList(get().items),

      getItemById: (id) => get().items.find((item) => item.id === id),

      hydrateFromParsedJson: (data) => {
        if (!data || typeof data !== "object") return
        set(normalizeAppState(data))
      },

      setActiveWorkspace: (activeWorkspace) =>
        set((s) => ({ ui: { ...s.ui, activeWorkspace } })),

      setItemsQuery: (itemsQuery) => set((s) => ({ ui: { ...s.ui, itemsQuery } })),

      setTreeQuery: (treeQuery) => set((s) => ({ ui: { ...s.ui, treeQuery } })),

      setDomainFilter: (domainFilter) =>
        set((s) => ({ ui: { ...s.ui, domainFilter } })),

      setStatusFilter: (statusFilter) =>
        set((s) => ({ ui: { ...s.ui, statusFilter } })),

      setDueDateFilter: (dueDateFilter) =>
        set((s) => ({ ui: { ...s.ui, dueDateFilter } })),

      applyTasksListFilters: (p) =>
        set((s) => ({
          ui: {
            ...s.ui,
            itemsQuery: p.itemsQuery,
            priorityFilters: p.priorityFilters,
            typeFilters: p.typeFilters,
            domainFilter: p.domainFilter,
            ownerFilter: p.ownerFilter,
            statusFilter: "",
            dueDateFilter: "",
          },
        })),

      selectItem: (selectedItemId) => set((s) => ({ ui: { ...s.ui, selectedItemId } })),

      toggleDomainExpanded: (domainId) =>
        set((s) => {
          const cur = new Set(s.ui.expandedDomainIds)
          if (cur.has(domainId)) cur.delete(domainId)
          else cur.add(domainId)
          return { ui: { ...s.ui, expandedDomainIds: [...cur] } }
        }),

      setTreeExpandAll: (expand) =>
        set((s) => ({
          ui: {
            ...s.ui,
            expandedDomainIds: expand ? walkDomainsFlat(s.domains).map((d) => d.id) : [],
          },
        })),

      toggleTreeItemPreview: (itemId) =>
        set((s) => ({
          ui: {
            ...s.ui,
            selectedItemId: itemId,
            treePreviewItemId:
              s.ui.treePreviewItemId === itemId ? "" : itemId,
          },
        })),

      saveSelectedItem: async (patch) => {
        const id = get().ui.selectedItemId
        if (!id) return false
        const item = get().items.find((i) => i.id === id)
        if (!item) return false

        if (item.status === "확정" || item.isLocked) {
          await appAlert(
            "확정된 항목은 직접 수정할 수 없습니다. 확정을 해제하거나 변경 요청 항목을 새로 생성해 주세요.",
          )
          return false
        }

        if (!patch.title.trim()) {
          await appAlert("제목을 입력해 주세요.")
          return false
        }

        const before = JSON.stringify(item)
        const nextStatus = normalizeStatusValue(patch.status)
        const nextType = normalizeItemType(patch.type)
        const updated: Item = {
          ...item,
          type: nextType,
          title: patch.title.trim(),
          domain: patch.domain,
          priority: patch.priority,
          status: nextStatus,
          owner: patch.owner.trim(),
          dueDate: patch.dueDate,
          description: patch.description.trim(),
          clientResponse: patch.clientResponse.trim(),
          finalConfirmedValue: patch.finalConfirmedValue.trim(),
          isLocked: nextStatus === "확정",
          boardRank:
            nextStatus !== item.status
              ? nextBoardRankForStatus(get().items, nextStatus, id)
              : item.boardRank,
          updatedAt: nowIso(),
        }

        set((s) => ({
          items: s.items.map((i) => (i.id === id ? updated : i)),
          history:
            before !== JSON.stringify(updated)
              ? (() => {
                  const h = [...s.history]
                  addHistory(
                    h,
                    id,
                    "item.updated",
                    `${updated.code} 항목을 수정`,
                    resolveHistoryActor(),
                  )
                  return h
                })()
              : s.history,
        }))
        return true
      },

      toggleLockSelectedItem: async () => {
        const id = get().ui.selectedItemId
        if (!id) return false
        const item = get().items.find((i) => i.id === id)
        if (!item) return false

        if (item.status !== "확정") {
          if (item.status !== "방향합의") {
            await appAlert("확정 처리 전 상태를 먼저 방향합의로 맞춰 주세요.")
            return false
          }
          const updated: Item = {
            ...item,
            isLocked: true,
            status: "확정",
            boardRank: nextBoardRankForStatus(get().items, "확정", id),
            updatedAt: nowIso(),
          }
          set((s) => {
            const h = [...s.history]
            addHistory(
              h,
              id,
              "item.locked",
              `${item.code} 항목을 최종 기준으로 확정`,
              resolveHistoryActor(),
            )
            return {
              items: s.items.map((i) => (i.id === id ? updated : i)),
              history: h,
            }
          })
          return true
        }

        const updated: Item = {
          ...item,
          isLocked: false,
          status: "방향합의",
          boardRank: nextBoardRankForStatus(get().items, "방향합의", id),
          updatedAt: nowIso(),
        }
        set((s) => {
          const h = [...s.history]
          addHistory(
            h,
            id,
            "item.unlocked",
            `${item.code} 항목 확정 해제`,
            resolveHistoryActor(),
          )
          return {
            items: s.items.map((i) => (i.id === id ? updated : i)),
            history: h,
          }
        })
        return true
      },

      addComment: async (author, body) => {
        const id = get().ui.selectedItemId
        if (!id) return false
        const item = get().items.find((i) => i.id === id)
        if (!item) return false
        if (!author.trim() || !body.trim()) {
          await appAlert("작성자와 코멘트 내용을 입력해 주세요.")
          return false
        }

        set((s) => {
          const comments = [
            ...s.comments,
            {
              id: uniqueId("C"),
              itemId: id,
              author: author.trim(),
              body: body.trim(),
              createdAt: nowIso(),
            },
          ]
          const history = [...s.history]
          addHistory(
            history,
            id,
            "comment.added",
            `${item.code} 항목에 코멘트`,
            resolveHistoryActor(),
          )
          return { comments, history }
        })
        return true
      },

      addCommentFromApi: async (comment) => {
        const item = get().items.find((i) => i.id === comment.itemId)
        if (!item) return false
        const author = comment.author?.trim()
        const body = comment.body?.trim()
        if (!author || !body) {
          await appAlert("작성자와 코멘트 내용을 입력해 주세요.")
          return false
        }
        const normalized: Comment = {
          ...comment,
          author,
          body,
        }
        set((s) => {
          const comments = [...s.comments, normalized]
          const history = [...s.history]
          addHistory(
            history,
            normalized.itemId,
            "comment.added",
            `${item.code} 항목에 코멘트`,
            resolveHistoryActor(),
            normalized.createdAt,
          )
          return { comments, history }
        })
        return true
      },

      deleteItem: async (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (!item) return
        const ok = await appConfirm(
          `[${item.code}] ${item.title}\n\n이 항목을 삭제하면 관련 코멘트와 이력도 함께 제거됩니다. 이 작업은 되돌릴 수 없습니다.`,
          {
            intent: "destructive",
            title: "항목 삭제",
            confirmLabel: "삭제",
          },
        )
        if (!ok) return

        set((s) => {
          const items = s.items.filter((entry) => entry.id !== itemId)
          const comments = s.comments.filter((c) => c.itemId !== itemId)
          const history = s.history.filter((h) => h.itemId !== itemId)
          let selectedItemId = s.ui.selectedItemId
          if (selectedItemId === itemId) {
            selectedItemId = items[0]?.id ?? null
          }
          let treePreviewItemId = s.ui.treePreviewItemId
          if (treePreviewItemId === itemId) treePreviewItemId = ""
          return {
            items,
            comments,
            history,
            ui: { ...s.ui, selectedItemId, treePreviewItemId },
          }
        })
      },

      moveItemToDomain: (itemId, targetDomainId) => {
        const item = get().items.find((i) => i.id === itemId)
        const target = getDomainMap(get().domains).get(targetDomainId)
        if (!item || !target || item.domain === targetDomainId) return

        const beforeLabel = getDomainPathLabel(get().domains, item.domain)
        set((s) => {
          const items = s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  domain: targetDomainId,
                  updatedAt: nowIso(),
                }
              : i,
          )
          const history = [...s.history]
          addHistory(
            history,
            itemId,
            "item.domainMoved",
            `${item.code} 항목 도메인 이동: ${beforeLabel} → ${getDomainPathLabel(s.domains, targetDomainId)}`,
            "트리 이동",
          )
          return { items, history }
        })
      },

      moveDomainNode: (dragDomainId, parentId, insertIndex) => {
        const domains = get().domains
        const result = moveDomainNodeInState(
          domains,
          dragDomainId,
          parentId,
          insertIndex,
        )
        if (!result.ok) return result.message
        const domain = result.domains.find((d) => d.id === dragDomainId)
        set((s) => {
          const exp = new Set(s.ui.expandedDomainIds)
          if (domain) exp.add(domain.id)
          if (parentId) exp.add(parentId)
          return {
            domains: result.domains,
            ui: { ...s.ui, expandedDomainIds: [...exp] },
          }
        })
        return undefined
      },

      applyDomainDrop: (dragDomainId, targetDomainId, position) => {
        const result = applyDomainDropPositionInState(
          get().domains,
          dragDomainId,
          targetDomainId,
          position,
        )
        if (!result.ok) return result.message
        set({ domains: result.domains })
        return undefined
      },

      createItem: async (input) => {
        if (!input.title.trim()) {
          await appAlert("제목을 입력해 주세요.")
          return undefined
        }
        const nextStatus = normalizeStatusValue(input.status ?? "논의")
        const code = getNextItemCode(get().items, input.type)
        const item: Item = {
          id: code,
          code,
          type: input.type,
          domain: input.domain,
          title: input.title.trim(),
          description: input.description.trim(),
          priority: input.priority,
          status: nextStatus,
          owner: input.owner.trim(),
          dueDate: input.dueDate,
          clientResponse: (input.clientResponse ?? "").trim(),
          finalConfirmedValue: (input.finalConfirmedValue ?? "").trim(),
          isLocked: nextStatus === "확정",
          boardRank: nextBoardRankForStatus(get().items, nextStatus),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }

        const normalizedInitial =
          input.initialComments
            ?.map((c) => ({
              author: c.author.trim(),
              body: c.body.trim(),
              createdAt: c.createdAt,
            }))
            .filter((c) => c.author && c.body) ?? []

        const newComments: Comment[] = normalizedInitial.map((c) => ({
          id: uniqueId("C"),
          itemId: item.id,
          author: c.author,
          body: c.body,
          createdAt: c.createdAt,
        }))

        set((s) => {
          const history = [...s.history]
          const actor = resolveHistoryActor()
          addHistory(history, item.id, "item.created", `${item.code} 항목을 저장`, actor)
          for (const c of newComments) {
            addHistory(
              history,
              item.id,
              "comment.added",
              `${item.code} 항목에 코멘트`,
              actor,
              c.createdAt,
            )
          }
          return {
            items: [...s.items, item],
            comments: [...s.comments, ...newComments],
            ui: { ...s.ui, selectedItemId: item.id },
            history,
          }
        })
        return item.id
      },

      createDomain: async (name, parentId = "") => {
        const value = normalizeTextValue(name)
        if (!value) {
          await appAlert("도메인 이름을 입력해 주세요.")
          return null
        }

        const domains = get().domains
        const existing = findDomainByAny(value, domains)
        if (existing) {
          set((s) => {
            const exp = new Set(s.ui.expandedDomainIds)
            if (!exp.has(existing.id)) exp.add(existing.id)
            return { ui: { ...s.ui, expandedDomainIds: [...exp] } }
          })
          return existing
        }

        const newDomain: Domain = {
          id: (() => {
            const cleaned = normalizeKey(value)
              .replace(/[^a-z0-9가-힣]/g, "")
              .slice(0, 16)
            return cleaned
              ? `dom-${cleaned}-${Date.now().toString(36).slice(-5)}`
              : uniqueId("DOM")
          })(),
          name: value,
          parentId: parentId || "",
          order: getChildDomains(domains, parentId).length,
        }

        set((s) => {
          const next = [...s.domains, newDomain]
          normalizeDomainOrders(next)
          const exp = new Set(s.ui.expandedDomainIds)
          if (parentId && !exp.has(parentId)) exp.add(parentId)
          if (!exp.has(newDomain.id)) exp.add(newDomain.id)
          return {
            domains: next,
            ui: { ...s.ui, expandedDomainIds: [...exp] },
          }
        })
        return newDomain
      },

      createChildDomain: async (parentDomainId) => {
        const parent = getDomainMap(get().domains).get(parentDomainId)
        if (!parent) return
        const name = await appPrompt(
          `[${parent.name}] 하위 도메인 이름을 입력해 주세요.`,
        )
        if (!normalizeTextValue(name ?? "")) return
        await get().createDomain(name!, parentDomainId)
      },

      renameDomain: async (domainId) => {
        const domain = getDomainMap(get().domains).get(domainId)
        if (!domain) return
        const nextName = await appPrompt(
          "도메인 이름을 입력해 주세요.",
          domain.name,
        )
        const value = normalizeTextValue(nextName ?? "")
        if (!value || value === domain.name) return

        const collision = get().domains.find(
          (entry) =>
            entry.id !== domainId && normalizeKey(entry.name) === normalizeKey(value),
        )
        if (collision) {
          await appAlert("같은 이름의 도메인이 이미 있습니다.")
          return
        }

        set((s) => ({
          domains: s.domains.map((d) =>
            d.id === domainId ? { ...d, name: value } : d,
          ),
        }))
      },

      deleteDomainNode: async (domainId) => {
        const domain = getDomainMap(get().domains).get(domainId)
        if (!domain) return

        if (get().domains.length <= 1) {
          await appAlert(
            "도메인은 최소 1개 이상 있어야 하므로 마지막 도메인은 삭제할 수 없습니다.",
          )
          return
        }

        const childDomains = getChildDomains(get().domains, domain.id)
        const directItems = get().items.filter((item) => item.domain === domain.id)

        let fallbackDomainId = domain.parentId || ""
        if (!fallbackDomainId) {
          fallbackDomainId =
            childDomains[0]?.id || getFallbackDomainId(get().domains, domain.id)
        }
        const fallbackLabel = fallbackDomainId
          ? getDomainPathLabel(get().domains, fallbackDomainId)
          : "-"

        const ok = await appConfirm(
          `「${domain.name}」 도메인을 삭제하시겠습니까?\n\n직속 하위 도메인은 상위 레벨로 올라가며, 직속 아이템 ${directItems.length}개는 「${fallbackLabel}」로 이동합니다. 이 작업은 되돌릴 수 없습니다.`,
          {
            intent: "destructive",
            title: "도메인 삭제",
            confirmLabel: "삭제",
          },
        )
        if (!ok) return

        set((s) => {
          const draftDomains = s.domains.map((d) => ({ ...d }))
          const draftItems = s.items.map((i) => ({ ...i }))
          const dm = getDomainMap(draftDomains)
          const dom = dm.get(domainId)
          if (!dom) return s

          const children = getChildDomains(draftDomains, domainId)
          children.forEach((child) => {
            const c = dm.get(child.id)
            if (c) c.parentId = dom.parentId || ""
          })

          directItems.forEach((item) => {
            if (fallbackDomainId) {
              const it = draftItems.find((x) => x.id === item.id)
              if (it) {
                it.domain = fallbackDomainId
                it.updatedAt = nowIso()
              }
            }
          })

          const history = [...s.history]
          directItems.forEach((item) => {
            if (fallbackDomainId) {
              addHistory(
                history,
                item.id,
                "item.domainReassigned",
                `${item.code} 항목 도메인 자동 이동: ${domain.name} → ${fallbackLabel}`,
                "도메인 삭제",
              )
            }
          })

          const domains = draftDomains.filter((entry) => entry.id !== domainId)
          normalizeDomainOrders(domains)
          const expandedDomainIds = s.ui.expandedDomainIds.filter((id) => id !== domainId)

          return {
            domains,
            items: draftItems,
            history,
            ui: { ...s.ui, expandedDomainIds },
          }
        })
      },

      executeBulkImport: async (rows) => {
        const actionable = rows.filter(
          (row) => row.action === "create" || row.action === "update",
        )
        if (!actionable.length) {
          await appAlert("실행 가능한 행이 없습니다. 먼저 미리보기를 확인해 주세요.")
          return
        }

        set((s) => {
          const items = [...s.items]
          const domains = [...s.domains]
          const history = [...s.history]

          const applyOne = (row: ImportRowResult) => {
            const data = row.itemData
            if (!data) return

            if (row.action === "create") {
              const resolvedDomainId = resolveDomainValue(data.domain, domains, {
                createIfMissing: true,
              })
              const code = data.code || getNextItemCode(items, data.type as ItemType)
              const nextStatus = normalizeStatusValue(data.status)
              const item: Item = {
                id: code,
                code,
                type: normalizeItemType(data.type),
                domain: resolvedDomainId,
                title: data.title,
                description: data.description,
                priority: data.priority as Item["priority"],
                status: nextStatus,
                owner: data.owner,
                dueDate: data.dueDate,
                clientResponse: data.clientResponse,
                finalConfirmedValue: data.finalConfirmedValue,
                isLocked: nextStatus === "확정",
                boardRank: nextBoardRankForStatus(items, nextStatus),
                createdAt: nowIso(),
                updatedAt: nowIso(),
              }
              items.push(item)
              addHistory(
                history,
                item.id,
                "item.bulkCreated",
                `${item.code} 항목을 엑셀 일괄등록으로 생성`,
                "엑셀 일괄등록",
              )
              return
            }

            if (row.action === "update" && row.existingId) {
              const item = items.find((i) => i.id === row.existingId)
              if (!item) return
              const resolvedDomainId = resolveDomainValue(data.domain, domains, {
                createIfMissing: true,
              })
              const nextStatus = normalizeStatusValue(data.status)
              const statusChanged = nextStatus !== item.status
              Object.assign(item, {
                type: normalizeItemType(data.type),
                domain: resolvedDomainId,
                title: data.title,
                description: data.description,
                priority: data.priority as Item["priority"],
                status: nextStatus,
                owner: data.owner,
                dueDate: data.dueDate,
                clientResponse: data.clientResponse,
                finalConfirmedValue: data.finalConfirmedValue,
                isLocked: nextStatus === "확정",
                updatedAt: nowIso(),
              })
              if (statusChanged) {
                item.boardRank = nextBoardRankForStatus(items, nextStatus, item.id)
              }
              addHistory(
                history,
                item.id,
                "item.bulkUpdated",
                `${item.code} 항목을 엑셀 일괄등록으로 업데이트`,
                "엑셀 일괄등록",
              )
            }
          }

          actionable.forEach(applyOne)
          normalizeDomainOrders(domains)
          return { items, domains, history }
        })
      },

      exportStateJson: () =>
        JSON.stringify(
          {
            ui: get().ui,
            project: get().project,
            domains: get().domains,
            items: get().items,
            comments: get().comments,
            history: get().history,
          },
          null,
          2,
        ),

      resetToSample: async () => {
        const ok = await appConfirm(
          "현재 데이터가 모두 사라지고 샘플 데이터로 바뀝니다. 되돌릴 수 없습니다.",
          {
            intent: "destructive",
            title: "샘플 데이터로 초기화",
            confirmLabel: "초기화",
          },
        )
        if (!ok) return
        set(normalizeAppState(createSeedData()))
      },

      setWorkspaceColumnOrder: (order) =>
        set((s) => ({ ui: { ...s.ui, workspaceColumnOrder: order } })),

      reorderWorkspaceItemsInStatus: (status, orderedIds) => {
        set((s) => {
          const rankMap = new Map(orderedIds.map((id, i) => [id, i]))
          const items = s.items.map((item) => {
            if (item.status !== status) return item
            const r = rankMap.get(item.id)
            if (r === undefined) return item
            return { ...item, boardRank: r }
          })
          return { items }
        })
      },

      moveWorkspaceCardToStatus: (itemId, targetStatus, targetIndex) => {
        set((s) => {
          const item = s.items.find((i) => i.id === itemId)
          if (!item) return {}
          if (item.isLocked && item.status !== "확정") return {}
          if (item.status === targetStatus) return {}

          const sourceStatus = item.status
          const now = nowIso()
          const nextLocked = targetStatus === "확정"

          let items = s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  status: targetStatus,
                  isLocked: nextLocked,
                  updatedAt: now,
                }
              : i,
          )

          const sourceIds = items
            .filter((i) => i.status === sourceStatus)
            .sort(sortItemsByBoardRank)
            .map((i) => i.id)

          const targetPeers = items
            .filter((i) => i.status === targetStatus && i.id !== itemId)
            .sort(sortItemsByBoardRank)
            .map((i) => i.id)

          const idx = Math.min(Math.max(0, targetIndex), targetPeers.length)
          const newTargetIds = [
            ...targetPeers.slice(0, idx),
            itemId,
            ...targetPeers.slice(idx),
          ]

          const rankById = new Map<string, number>()
          sourceIds.forEach((id, i) => rankById.set(id, i))
          newTargetIds.forEach((id, i) => rankById.set(id, i))

          items = items.map((i) => {
            const r = rankById.get(i.id)
            if (r === undefined) return i
            return { ...i, boardRank: r }
          })

          return { items }
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ui: state.ui,
        project: state.project,
        domains: state.domains,
        items: state.items,
        comments: state.comments,
        history: state.history,
      }),
      merge: (persisted, current) => {
        const c = current as AppStore
        if (!persisted || typeof persisted !== "object") return c
        const seed = createSeedData()
        const merged = normalizeAppState({
          ...seed,
          ...(persisted as object),
        })
        const seedProject = seed.project
        if (merged.project.id === seedProject.id) {
          merged.project = {
            ...merged.project,
            name: seedProject.name,
            subtitle: seedProject.subtitle,
          }
        }
        return {
          ...c,
          ...merged,
        }
      },
    },
  ),
)
