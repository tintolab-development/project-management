import { z } from "zod"

export const adminAccountMemberSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  /** 로그인 아이디(목록·중복 검사용, 비밀번호는 포함하지 않음) */
  loginId: z.string(),
  /** 소속(프로젝트) 표시명 */
  affiliation: z.string(),
  name: z.string(),
  jobTitle: z.string(),
  email: z.string(),
  phone: z.string(),
  permission: z.string(),
})

export type AdminAccountMember = z.infer<typeof adminAccountMemberSchema>

export const adminAccountGroupSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  rows: z.array(adminAccountMemberSchema),
})

export type AdminAccountGroup = z.infer<typeof adminAccountGroupSchema>

export const adminAccountsGroupedResponseSchema = z.object({
  organizationCount: z.number(),
  groups: z.array(adminAccountGroupSchema),
})

export type AdminAccountsGroupedResponse = z.infer<
  typeof adminAccountsGroupedResponseSchema
>
