import { z } from "zod"

/** 느슨한 검증: 마이그레이션·외부 JSON과의 호환용. 실제 정규화는 normalizeAppState에서 수행 */
export const persistedStateSchema = z
  .object({
    ui: z.record(z.string(), z.unknown()).optional(),
    project: z.record(z.string(), z.unknown()).optional(),
    domains: z.array(z.unknown()).optional(),
    items: z.array(z.unknown()).optional(),
    comments: z.array(z.unknown()).optional(),
    history: z.array(z.unknown()).optional(),
  })
  .passthrough()

export type PersistedStateInput = z.infer<typeof persistedStateSchema>

export const safeParsePersisted = (data: unknown) =>
  persistedStateSchema.safeParse(data)
