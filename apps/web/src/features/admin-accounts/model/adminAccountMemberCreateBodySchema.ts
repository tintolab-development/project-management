import { z } from "zod"

export const ADMIN_ACCOUNT_PERMISSION_VALUES = ["뷰어", "편집자", "관리자"] as const

export const adminAccountMemberCreateBodySchema = z.object({
  projectId: z.string().min(1),
  loginId: z.string().min(1),
  password: z.string().min(1),
  permission: z.enum(ADMIN_ACCOUNT_PERMISSION_VALUES),
  name: z.string().min(1),
  jobTitle: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
})

export type AdminAccountMemberCreateBody = z.infer<
  typeof adminAccountMemberCreateBodySchema
>

export const adminAccountLoginIdAvailabilityBodySchema = z.object({
  loginId: z.string().min(1),
})

export type AdminAccountLoginIdAvailabilityBody = z.infer<
  typeof adminAccountLoginIdAvailabilityBodySchema
>

export const adminAccountLoginIdAvailabilityResponseSchema = z.object({
  available: z.boolean(),
})

export type AdminAccountLoginIdAvailabilityResponse = z.infer<
  typeof adminAccountLoginIdAvailabilityResponseSchema
>
