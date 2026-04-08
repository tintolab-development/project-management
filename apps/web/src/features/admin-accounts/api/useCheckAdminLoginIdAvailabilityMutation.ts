import { useMutation } from "@tanstack/react-query"

import { postAdminAccountLoginIdAvailability } from "./adminAccountsApi"

export const useCheckAdminLoginIdAvailabilityMutation = () => {
  return useMutation({
    mutationFn: postAdminAccountLoginIdAvailability,
  })
}
