import { z } from "zod"

export const adminLogRowSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  editedAt: z.string(),
  projectName: z.string(),
  category: z.string(),
  itemName: z.string(),
  editContent: z.string(),
  affiliation: z.string(),
  editor: z.string(),
  ip: z.string(),
})

export type AdminLogRow = z.infer<typeof adminLogRowSchema>

export const adminLogsListResponseSchema = z.object({
  items: z.array(adminLogRowSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
})

export type AdminLogsListResponse = z.infer<typeof adminLogsListResponseSchema>
