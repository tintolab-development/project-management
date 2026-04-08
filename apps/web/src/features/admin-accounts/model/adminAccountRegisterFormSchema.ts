import { z } from "zod"

import { ADMIN_ACCOUNT_PERMISSION_VALUES } from "./adminAccountMemberCreateBodySchema"

export const adminAccountRegisterFormSchema = z.object({
  loginId: z.string().trim().min(1, "아이디를 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
  permission: z.enum(ADMIN_ACCOUNT_PERMISSION_VALUES),
  name: z.string().trim().min(1, "이름을 입력하세요"),
  jobTitle: z.string().trim().min(1, "직무 또는 직급을 입력하세요"),
  email: z.string().trim(),
  phone: z.string().trim(),
})

export type AdminAccountRegisterFormValues = z.infer<
  typeof adminAccountRegisterFormSchema
>
