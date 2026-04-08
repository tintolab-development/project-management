import { z } from "zod"

export const memberProfileFormSchema = z.object({
  displayName: z.string().trim().min(1, "이름을 입력하세요."),
  loginId: z
    .string()
    .trim()
    .min(2, "아이디는 2자 이상이어야 합니다.")
    .max(64, "아이디가 너무 깁니다."),
  phone: z
    .string()
    .trim()
    .min(1, "휴대폰번호를 입력하세요.")
    .regex(/^[\d\s()+-]+$/, "숫자와 하이픈만 사용할 수 있습니다."),
  email: z.string().trim().email("올바른 이메일을 입력하세요."),
  password: z.string().refine(
    (v) => v === "" || v.length >= 8,
    "비밀번호를 바꿀 경우 8자 이상 입력하세요.",
  ),
})

export type MemberProfileFormValues = z.infer<typeof memberProfileFormSchema>
