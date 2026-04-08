import type { AdminAccountsListState } from "./adminAccountsListParams"

export const adminAccountsQueryKeys = {
  all: ["admin-accounts"] as const,
  grouped: (state: AdminAccountsListState) =>
    [...adminAccountsQueryKeys.all, "grouped", state] as const,
}
