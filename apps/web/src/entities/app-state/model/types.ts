import type { Comment } from "@/entities/comment/model/types"
import type { Domain } from "@/entities/domain/model/types"
import type { HistoryEntry } from "@/entities/history/model/types"
import type { Item } from "@/entities/item/model/types"

export type UiState = {
  activeWorkspace: "information_request" | "decision"
  selectedItemId: string | null
  expandedDomainIds: string[]
  itemsQuery: string
  treeQuery: string
  treePreviewItemId: string
  treeManageDomainId: string
  typeFilter: string
  domainFilter: string
  statusFilter: string
}

export type ProjectState = {
  id: string
  name: string
  subtitle: string
}

export type AppState = {
  ui: UiState
  project: ProjectState
  domains: Domain[]
  items: Item[]
  comments: Comment[]
  history: HistoryEntry[]
}
