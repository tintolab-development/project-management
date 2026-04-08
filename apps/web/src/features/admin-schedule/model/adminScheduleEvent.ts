import { z } from "zod"

export const adminScheduleEventSchema = z.object({
  id: z.string(),
  adminProjectId: z.string(),
  projectName: z.string(),
  ownerName: z.string(),
  affiliation: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export type AdminScheduleEvent = z.infer<typeof adminScheduleEventSchema>
