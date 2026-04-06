export type PageIndexItem = number | "ellipsis"

/**
 * 0-based 페이지 인덱스 목록(필요 시 ellipsis). 숫자 버튼은 최대 `maxNumericButtons`개까지 노출합니다.
 */
export function getVisiblePageIndices(
  pageIndex: number,
  pageCount: number,
  maxNumericButtons = 10,
): PageIndexItem[] {
  if (pageCount <= 0) return []
  if (pageCount <= maxNumericButtons) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }

  const indices = new Set<number>()
  indices.add(0)
  indices.add(pageCount - 1)

  const innerBudget = maxNumericButtons - 2
  const radius = Math.floor(innerBudget / 2)
  let start = Math.max(1, pageIndex - radius)
  const end = Math.min(pageCount - 2, start + innerBudget - 1)
  if (end - start + 1 < innerBudget) {
    start = Math.max(1, end - innerBudget + 1)
  }
  for (let i = start; i <= end; i++) {
    indices.add(i)
  }

  const sorted = [...indices].sort((a, b) => a - b)
  const result: PageIndexItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    const v = sorted[i]!
    if (i > 0 && v - sorted[i - 1]! > 1) {
      result.push("ellipsis")
    }
    result.push(v)
  }
  return result
}
