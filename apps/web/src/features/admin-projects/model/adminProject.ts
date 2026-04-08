import { z } from "zod"

export const adminProjectStatusSchema = z.enum([
  "in_progress",
  "upcoming",
  "completed",
])

export const adminProjectTypeSchema = z.enum([
  "internal",
  "external",
  "rnd",
  "poc",
])

export const adminProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: adminProjectStatusSchema,
  projectType: adminProjectTypeSchema,
  platformTags: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
  participantNames: z.array(z.string()),
  slug: z.string().optional(),
})

export type AdminProject = z.infer<typeof adminProjectSchema>

export type AdminProjectStatus = z.infer<typeof adminProjectStatusSchema>

export type AdminProjectType = z.infer<typeof adminProjectTypeSchema>
