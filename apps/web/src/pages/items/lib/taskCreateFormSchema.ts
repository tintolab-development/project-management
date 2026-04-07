import { z } from "zod"

import { PRIORITY_VALUES, type ItemType, type Priority } from "@/entities/item/model/types"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"

const taskTypeTuple = ITEM_TYPE_VALUES as unknown as [ItemType, ...ItemType[]]

const taskPriorityTuple = PRIORITY_VALUES as unknown as [Priority, ...Priority[]]

const taskStatusTuple = ["논의", "방향합의", "확정"] as const

const taskFormSharedSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  type: z.enum(taskTypeTuple),
  domain: z.string().min(1, "분류를 선택해 주세요."),
  priority: z.enum(taskPriorityTuple),
  status: z.enum(taskStatusTuple),
  dueDate: z.string().trim().min(1, "마감일을 선택해 주세요."),
  description: z.string().trim().min(1, "프로젝트 설명을 입력해 주세요."),
  /** 옵셔널 — 비워 둘 수 있음 */
  clientResponse: z.string(),
  /** 옵셔널 — 비워 둘 수 있음 */
  finalConfirmedValue: z.string(),
  assignees: z
    .array(z.string().min(1))
    .min(1, "담당자를 한 명 이상 추가해 주세요."),
  relatedLabels: z.array(z.string().min(1)),
})

/** `/tasks/new` — 연관 태스크 표시 이름을 한 개 이상 */
export const taskNewFormSchema = taskFormSharedSchema.extend({
  relatedLabels: z
    .array(z.string().min(1))
    .min(1, "연관 태스크를 한 개 이상 추가해 주세요."),
})

/** `/tasks/:itemId` — 연관 태스크는 UI 전용이라 도메인에 없음; 빈 배열 허용 */
export const taskEditFormSchema = taskFormSharedSchema

export type TaskCreateFormValues = z.infer<typeof taskNewFormSchema>
