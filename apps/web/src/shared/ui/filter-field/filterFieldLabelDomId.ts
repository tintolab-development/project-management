/** 트리거 `aria-labelledby`와 동일 id — 라벨은 `<label htmlFor>` 미사용(클릭 시 드롭다운 비활성) */
export const filterFieldLabelDomId = (controlId: string) =>
  `${controlId}-field-label`
