import type { Item } from "@/entities/item/model/types"

const compareCodeThenTitle = (a: Item, b: Item) => {
  if (a.code === b.code) return a.title.localeCompare(b.title, "ko")
  return a.code > b.code ? 1 : -1
}

/** 워크스페이스 컬럼 내 표시 순서: boardRank → code. */
export function sortItemsByBoardRank(a: Item, b: Item): number {
  if (a.boardRank !== b.boardRank) return a.boardRank - b.boardRank
  return compareCodeThenTitle(a, b)
}
