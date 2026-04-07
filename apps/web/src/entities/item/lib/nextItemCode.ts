import type { Item, ItemType } from "../model/types"

/** 기존 `items`와 유형에 따라 다음 항목 코드(예: D-001)를 계산한다. */
export const getNextItemCode = (items: Item[], type: ItemType): string => {
  const prefix =
    type === "information_request"
      ? "IR"
      : type === "decision"
        ? "D"
        : type === "review"
          ? "R"
          : type === "issue"
            ? "ISS"
            : "CR"

  const nums = items
    .filter((item) => item.code.startsWith(prefix))
    .map((item) => Number(item.code.split("-")[1] || "0"))
    .filter((num) => !Number.isNaN(num))

  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${String(next).padStart(3, "0")}`
}
