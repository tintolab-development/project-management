import type { Comment } from "@/entities/comment/model/types"
import type { Domain } from "@/entities/domain/model/types"
import type { HistoryEntry } from "@/entities/history/model/types"
import type { Item, ItemType, Priority } from "@/entities/item/model/types"
import type { ItemStatus } from "@/shared/constants/labels"

export type UiState = {
  activeWorkspace: "information_request" | "decision"
  selectedItemId: string | null
  expandedDomainIds: string[]
  itemsQuery: string
  treeQuery: string
  treePreviewItemId: string
  treeManageDomainId: string
  /** 비어 있으면 유형 전체 */
  typeFilters: ItemType[]
  domainFilter: string
  statusFilter: string
  /** 비어 있으면 우선순위 전체 */
  priorityFilters: Priority[]
  dueDateFilter: string
  /** 비어 있으면 담당자 전체 */
  ownerFilter: string
  /** 워크스페이스 칸반 상태 컬럼(위젯) 가로 순서 */
  workspaceColumnOrder: ItemStatus[]
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
