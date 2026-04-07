/** 1-base 페이지 — shadcn 스타일 구간 + ellipsis */
export const getTasksPaginationRange = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 1) return [1]
  const delta = 1
  const range: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i)
    }
  }
  const out: (number | "ellipsis")[] = []
  let prev: number | undefined
  for (const i of range) {
    if (prev !== undefined && i - prev > 1) {
      out.push("ellipsis")
    }
    out.push(i)
    prev = i
  }
  return out
}
