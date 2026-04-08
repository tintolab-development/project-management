import { useMutation, useQueryClient } from "@tanstack/react-query"

import { adminAccountsQueryKeys } from "../lib/adminAccountsQueryKeys"

import { postAdminAccountMemberCreate } from "./adminAccountsApi"

export const useCreateAdminAccountMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAdminAccountMemberCreate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.all })
    },
  })
}
