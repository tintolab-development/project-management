import { sortItemsByBoardRank } from "@/entities/item/lib/sortItemsByBoard"
import type { Item } from "@/entities/item/model/types"
import type { ItemStatus } from "@/shared/constants/labels"

/**
 * 워크스페이스가 탭/필터로 일부 항목만 보여줄 때, 컬럼 내에서 보이는 카드 순서만 바꾼 뒤
 * 같은 status에 있으나 현재 보드에 안 보이는 항목의 상대 순서는 유지한 전체 id 배열을 만든다.
 */
export function mergeVisibleReorderIntoStatusOrder(
  items: Item[],
  status: ItemStatus,
  visibleIdSet: Set<string>,
  newVisibleOrder: string[],
): string[] {
  const inStatusSorted = items
    .filter((i) => i.status === status)
    .sort(sortItemsByBoardRank)

  let vi = 0
  const merged: string[] = []
  for (const item of inStatusSorted) {
    if (visibleIdSet.has(item.id)) {
      const next = newVisibleOrder[vi]
      if (next !== undefined) {
        merged.push(next)
        vi += 1
      } else {
        merged.push(item.id)
      }
    } else {
      merged.push(item.id)
    }
  }
  return merged
}
