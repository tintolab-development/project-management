import { z } from "zod"

import { PRIORITY_VALUES, type ItemType, type Priority } from "@/entities/item/model/types"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"

const taskTypeTuple = ITEM_TYPE_VALUES as unknown as [
  ItemType,
  ...ItemType[],
]

const taskPriorityTuple = PRIORITY_VALUES as unknown as [
  Priority,
  ...Priority[],
]

export const taskCreateFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  type: z.enum(taskTypeTuple),
  domain: z.string().min(1, "분류를 선택해 주세요."),
  priority: z.enum(taskPriorityTuple),
  status: z.enum(["논의", "방향합의", "확정"]),
  dueDate: z.string(),
  description: z.string(),
  clientResponse: z.string(),
  finalConfirmedValue: z.string(),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateFormSchema>
