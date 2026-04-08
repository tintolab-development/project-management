export const memberProfileQueryKeys = {
  all: ["auth", "profile"] as const,
  detail: (userId: string) => [...memberProfileQueryKeys.all, userId] as const,
}
