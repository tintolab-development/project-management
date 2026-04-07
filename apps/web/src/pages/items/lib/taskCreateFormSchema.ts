import { z } from "zod"

import type { ItemType } from "@/entities/item/model/types"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"

const taskTypeTuple = ITEM_TYPE_VALUES as unknown as [
  ItemType,
  ...ItemType[],
]

export const taskCreateFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  type: z.enum(taskTypeTuple),
  domain: z.string().min(1, "분류를 선택해 주세요."),
  priority: z.enum(["P0", "P1", "P2"]),
  status: z.enum(["논의", "방향합의", "확정"]),
  dueDate: z.string(),
  description: z.string(),
  clientResponse: z.string(),
  finalConfirmedValue: z.string(),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateFormSchema>
