import { z } from "zod"

import {
  adminProjectStatusSchema,
  adminProjectTypeSchema,
} from "./adminProject"

/** POST /admin/projects 요청 본문 (클라이언트·MSW 공통) */
export const adminProjectCreateBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string(),
  status: adminProjectStatusSchema.optional(),
  projectType: adminProjectTypeSchema,
  platformTags: z.array(z.string()),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
  participantNames: z.array(z.string()),
})

export type AdminProjectCreateBody = z.infer<typeof adminProjectCreateBodySchema>
