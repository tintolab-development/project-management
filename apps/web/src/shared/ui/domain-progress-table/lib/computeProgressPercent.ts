/** 완료 수와 전체 수로 0–100 진행률(반올림)을 계산합니다. total이 0이면 0을 반환합니다. */
export function computeProgressPercent(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 100)
}
