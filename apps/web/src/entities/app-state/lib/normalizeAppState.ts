import type { Domain } from "@/entities/domain/model/types"
import { ensureDomainExistsByValue } from "@/entities/domain/lib/ensureDomain"
import { normalizeDomains } from "@/entities/domain/lib/normalizeDomains"
import { createSeedData } from "@/entities/app-state/model/seed"
import type { AppState, ProjectState, UiState } from "@/entities/app-state/model/types"
import type { Comment } from "@/entities/comment/model/types"
import type { HistoryEntry } from "@/entities/history/model/types"
import type { Item, ItemType, Priority } from "@/entities/item/model/types"
import { normalizeDateInput } from "@/shared/lib/dates"
import { uniqueId } from "@/shared/lib/ids"
import {
  ITEM_TYPE_VALUES,
  normalizeItemType,
} from "@/shared/lib/itemType"
import { normalizePriority } from "@/shared/lib/priority"
import { normalizeStatusValue } from "@/shared/lib/status"
import { normalizeTextValue } from "@/shared/lib/text"
import {
  STATUS_VALUES,
  type ItemStatus,
} from "@/shared/constants/labels"

const parseWorkspaceColumnOrder = (
  raw: unknown,
  fallback: ItemStatus[],
): ItemStatus[] => {
  if (!Array.isArray(raw)) return fallback
  const allowed = new Set<ItemStatus>(STATUS_VALUES)
  const mapped = raw
    .map((x) => String(x))
    .filter((x): x is ItemStatus => allowed.has(x as ItemStatus))
  if (mapped.length !== STATUS_VALUES.length) return fallback
  if (new Set(mapped).size !== mapped.length) return fallback
  return mapped
}

/** status별로 boardRank를 0..n-1로 정규화(누락·중복·간격 흡수). */
export const normalizeWorkspaceBoardRanks = (items: Item[]): Item[] => {
  const byStatus = new Map<ItemStatus, Item[]>()
  for (const s of STATUS_VALUES) byStatus.set(s, [])
  for (const item of items) {
    const list = byStatus.get(item.status)
    if (list) list.push(item)
  }
  const rankById = new Map<string, number>()
  for (const status of STATUS_VALUES) {
    const group = byStatus.get(status) ?? []
    const sorted = [...group].sort((a, b) => {
      const ra = Number.isFinite(a.boardRank) ? a.boardRank : Number.MAX_SAFE_INTEGER
      const rb = Number.isFinite(b.boardRank) ? b.boardRank : Number.MAX_SAFE_INTEGER
      if (ra !== rb) return ra - rb
      if (a.code === b.code) return a.title.localeCompare(b.title, "ko")
      return a.code > b.code ? 1 : -1
    })
    sorted.forEach((item, idx) => rankById.set(item.id, idx))
  }
  return items.map((i) => ({ ...i, boardRank: rankById.get(i.id) ?? 0 }))
}

const parsePriorityFilters = (raw: unknown, legacy: unknown): Priority[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((x) => String(x))
      .filter((x): x is Priority => x === "P0" || x === "P1" || x === "P2")
  }
  const legacyNorm = normalizeTextValue(legacy ?? "")
  if (legacyNorm === "P0" || legacyNorm === "P1" || legacyNorm === "P2") {
    return [legacyNorm]
  }
  return []
}

const parseTypeFilters = (raw: unknown, legacy: unknown): ItemType[] => {
  if (Array.isArray(raw)) {
    const allowed = new Set<ItemType>(ITEM_TYPE_VALUES)
    return raw
      .map((x) => normalizeItemType(x))
      .filter((t) => allowed.has(t))
  }
  const legacyNorm = normalizeTextValue(legacy ?? "")
  if (!legacyNorm) return []
  return [normalizeItemType(legacyNorm)]
}

const normalizeRawItem = (item: unknown, workingDomains: Domain[]): Item => {
  const i = item as Record<string, unknown>
  const nextStatus = normalizeStatusValue(i?.status)
  const resolvedDomainId = ensureDomainExistsByValue(i?.domain, workingDomains)
  const now = new Date().toISOString()

  return {
    id: normalizeTextValue(i?.id) || normalizeTextValue(i?.code) || uniqueId("I"),
    code: normalizeTextValue(i?.code) || normalizeTextValue(i?.id) || "",
    type: normalizeItemType(i?.type),
    domain: resolvedDomainId,
    title: normalizeTextValue(i?.title),
    description: normalizeTextValue(i?.description ?? ""),
    priority: normalizePriority(i?.priority),
    status: nextStatus,
    owner: normalizeTextValue(i?.owner ?? ""),
    dueDate: normalizeDateInput(i?.dueDate) || "",
    clientResponse: normalizeTextValue(i?.clientResponse ?? ""),
    finalConfirmedValue: normalizeTextValue(
      i?.finalConfirmedValue ?? i?.agreedValue ?? "",
    ),
    isLocked: nextStatus === "확정" || Boolean(i?.isLocked),
    boardRank:
      typeof i?.boardRank === "number" && Number.isFinite(i.boardRank)
        ? i.boardRank
        : 0,
    createdAt: normalizeTextValue(i?.createdAt) || now,
    updatedAt: normalizeTextValue(i?.updatedAt) || now,
  }
}

const normalizeComment = (c: unknown): Comment => {
  const row = c as Record<string, unknown>
  return {
    id: normalizeTextValue(row.id) || uniqueId("C"),
    itemId: normalizeTextValue(row.itemId),
    author: normalizeTextValue(row.author),
    body: normalizeTextValue(row.body),
    createdAt: normalizeTextValue(row.createdAt) || new Date().toISOString(),
  }
}

const normalizeHistory = (h: unknown): HistoryEntry => {
  const row = h as Record<string, unknown>
  return {
    id: normalizeTextValue(row.id) || uniqueId("H"),
    itemId: normalizeTextValue(row.itemId),
    eventType: normalizeTextValue(row.eventType),
    summary: normalizeTextValue(row.summary),
    actor: normalizeTextValue(row.actor),
    createdAt: normalizeTextValue(row.createdAt) || new Date().toISOString(),
  }
}

export const normalizeAppState = (raw: unknown): AppState => {
  const seed = createSeedData()
  if (!raw || typeof raw !== "object") return seed

  const normalized = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>
  const uiRaw = (normalized.ui ?? {}) as Record<string, unknown>

  const ui: UiState = {
    activeWorkspace:
      uiRaw.activeWorkspace === "decision" ? "decision" : "information_request",
    selectedItemId: (() => {
      const raw = uiRaw.selectedItemId
      if (raw === null) return null
      if (typeof raw === "string") return raw
      return seed.ui.selectedItemId
    })(),
    expandedDomainIds: Array.isArray(uiRaw.expandedDomainIds)
      ? uiRaw.expandedDomainIds.map(String)
      : seed.ui.expandedDomainIds,
    itemsQuery: normalizeTextValue(uiRaw.itemsQuery ?? uiRaw.searchQuery ?? ""),
    treeQuery: normalizeTextValue(uiRaw.treeQuery ?? uiRaw.searchQuery ?? ""),
    treePreviewItemId: normalizeTextValue(
      uiRaw.treePreviewItemId ?? uiRaw.selectedItemId ?? "",
    ),
    treeManageDomainId: normalizeTextValue(uiRaw.treeManageDomainId ?? ""),
    typeFilters: parseTypeFilters(uiRaw.typeFilters, uiRaw.typeFilter),
    domainFilter: normalizeTextValue(uiRaw.domainFilter ?? ""),
    statusFilter: normalizeTextValue(uiRaw.statusFilter ?? ""),
    priorityFilters: parsePriorityFilters(
      uiRaw.priorityFilters,
      uiRaw.priorityFilter,
    ),
    dueDateFilter: normalizeTextValue(uiRaw.dueDateFilter ?? ""),
    ownerFilter: normalizeTextValue(uiRaw.ownerFilter ?? ""),
    workspaceColumnOrder: parseWorkspaceColumnOrder(
      uiRaw.workspaceColumnOrder,
      seed.ui.workspaceColumnOrder,
    ),
  }

  const project: ProjectState = {
    ...seed.project,
    ...(typeof normalized.project === "object" && normalized.project
      ? (normalized.project as ProjectState)
      : {}),
  }

  const workingDomains = normalizeDomains(normalized.domains)

  const items: Item[] = Array.isArray(normalized.items)
    ? normalized.items.map((item) => normalizeRawItem(item, workingDomains))
    : seed.items

  const comments: Comment[] = Array.isArray(normalized.comments)
    ? normalized.comments.map(normalizeComment)
    : []

  const history: HistoryEntry[] = Array.isArray(normalized.history)
    ? normalized.history.map(normalizeHistory)
    : []

  const validExpandedIds = new Set(workingDomains.map((domain) => domain.id))
  const nextExpandedIds = ui.expandedDomainIds.filter((id) =>
    validExpandedIds.has(id),
  )
  ui.expandedDomainIds = nextExpandedIds.length
    ? nextExpandedIds
    : workingDomains.map((domain) => domain.id)

  if (
    ui.selectedItemId !== null &&
    !items.some((item) => item.id === ui.selectedItemId)
  ) {
    ui.selectedItemId = null
  }

  if (
    ui.treePreviewItemId &&
    !items.some((item) => item.id === ui.treePreviewItemId)
  ) {
    ui.treePreviewItemId = ""
  }

  if (
    ui.treeManageDomainId &&
    !workingDomains.some((domain) => domain.id === ui.treeManageDomainId)
  ) {
    ui.treeManageDomainId = workingDomains[0]?.id ?? ""
  }

  const itemsWithRanks = normalizeWorkspaceBoardRanks(items)

  return {
    ui,
    project,
    domains: workingDomains,
    items: itemsWithRanks,
    comments,
    history,
  }
}
