import { z } from "zod"

/** POST /admin/accounts/affiliations 요청 본문 (클라이언트·MSW 공통) */
export const adminAffiliationCreateBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
})

export type AdminAffiliationCreateBody = z.infer<
  typeof adminAffiliationCreateBodySchema
>

export const adminAffiliationCreateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "소속명을 입력해 주세요.")
    .max(120, "소속명은 120자 이하로 입력해 주세요."),
})

export type AdminAffiliationCreateFormValues = z.infer<
  typeof adminAffiliationCreateFormSchema
>
