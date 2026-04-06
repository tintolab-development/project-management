import type { Domain } from "@/entities/domain/model/types"
import { ensureDomainExistsByValue } from "@/entities/domain/lib/ensureDomain"
import { normalizeDomains } from "@/entities/domain/lib/normalizeDomains"
import { createSeedData } from "@/entities/app-state/model/seed"
import type { AppState, ProjectState, UiState } from "@/entities/app-state/model/types"
import type { Comment } from "@/entities/comment/model/types"
import type { HistoryEntry } from "@/entities/history/model/types"
import type { Item } from "@/entities/item/model/types"
import { normalizeDateInput } from "@/shared/lib/dates"
import { uniqueId } from "@/shared/lib/ids"
import { normalizeItemType } from "@/shared/lib/itemType"
import { normalizePriority } from "@/shared/lib/priority"
import { normalizeStatusValue } from "@/shared/lib/status"
import { normalizeTextValue } from "@/shared/lib/text"

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
    createdAt: normalizeTextValue(i?.createdAt) || now,
    updatedAt: normalizeTextValue(i?.updatedAt) || now,
  } as Item
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
    selectedItemId:
      typeof uiRaw.selectedItemId === "string"
        ? uiRaw.selectedItemId
        : seed.ui.selectedItemId,
    expandedDomainIds: Array.isArray(uiRaw.expandedDomainIds)
      ? uiRaw.expandedDomainIds.map(String)
      : seed.ui.expandedDomainIds,
    itemsQuery: normalizeTextValue(uiRaw.itemsQuery ?? uiRaw.searchQuery ?? ""),
    treeQuery: normalizeTextValue(uiRaw.treeQuery ?? uiRaw.searchQuery ?? ""),
    treePreviewItemId: normalizeTextValue(
      uiRaw.treePreviewItemId ?? uiRaw.selectedItemId ?? "",
    ),
    treeManageDomainId: normalizeTextValue(uiRaw.treeManageDomainId ?? ""),
    typeFilter: normalizeTextValue(uiRaw.typeFilter ?? ""),
    domainFilter: normalizeTextValue(uiRaw.domainFilter ?? ""),
    statusFilter: normalizeTextValue(uiRaw.statusFilter ?? ""),
    priorityFilter: normalizeTextValue(uiRaw.priorityFilter ?? ""),
    dueDateFilter: normalizeTextValue(uiRaw.dueDateFilter ?? ""),
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

  if (!items.some((item) => item.id === ui.selectedItemId)) {
    ui.selectedItemId = items[0]?.id ?? null
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

  return {
    ui,
    project,
    domains: workingDomains,
    items,
    comments,
    history,
  }
}
