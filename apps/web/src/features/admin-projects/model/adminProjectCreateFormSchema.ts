import { z } from "zod"

import {
  adminProjectStatusSchema,
  adminProjectTypeSchema,
} from "./adminProject"

export const adminProjectCreateFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "프로젝트명을 입력해 주세요.")
      .max(200, "프로젝트명은 200자 이하로 입력해 주세요."),
    description: z
      .string()
      .trim()
      .max(2000, "설명은 2000자 이하로 입력해 주세요."),
    status: adminProjectStatusSchema,
    projectType: adminProjectTypeSchema,
    platformTags: z
      .array(z.string())
      .min(1, "플랫폼을 하나 이상 선택해 주세요."),
    startDate: z.string().trim().min(1, "시작일을 선택해 주세요."),
    endDate: z.string().trim().min(1, "종료일을 선택해 주세요."),
    participantNames: z.array(z.string()),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "종료일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  })

export type AdminProjectCreateFormValues = z.infer<
  typeof adminProjectCreateFormSchema
>
