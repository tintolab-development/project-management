import { z } from "zod"

const emailSchema = z.string().trim().email("올바른 이메일을 입력하세요.")

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "비밀번호를 입력하세요."),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
