import type { Item } from "@/entities/item/model/types"

const compareCodeThenTitle = (a: Item, b: Item) => {
  if (a.code === b.code) return a.title.localeCompare(b.title, "ko")
  return a.code > b.code ? 1 : -1
}

/** 대시보드·워크스페이스 필터 등 전역 목록용 — 코드·제목 순(스토어 getSortedItems와 동일). */
export function sortItemsForGlobalList(items: Item[]): Item[] {
  return [...items].sort(compareCodeThenTitle)
}

/** 워크스페이스 컬럼 내 표시 순서: boardRank → code. */
export function sortItemsByBoardRank(a: Item, b: Item): number {
  if (a.boardRank !== b.boardRank) return a.boardRank - b.boardRank
  return compareCodeThenTitle(a, b)
}
