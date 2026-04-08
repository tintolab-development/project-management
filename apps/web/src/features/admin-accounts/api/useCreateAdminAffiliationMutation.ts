import { useMutation, useQueryClient } from "@tanstack/react-query"

import { adminAccountsQueryKeys } from "../lib/adminAccountsQueryKeys"
import { postAdminAffiliationCreate } from "./adminAccountsApi"

export const useCreateAdminAffiliationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAdminAffiliationCreate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.all })
      /** 계정관리 필터의 진행 중 프로젝트(소속) 옵션과 동기화 */
      void queryClient.invalidateQueries({ queryKey: ["admin-projects"] })
    },
  })
}
