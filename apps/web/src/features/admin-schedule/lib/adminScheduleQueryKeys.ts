export const adminScheduleQueryKeys = {
  all: ["admin-schedule"] as const,
  range: (from: string, to: string) =>
    [...adminScheduleQueryKeys.all, "range", from, to] as const,
}
