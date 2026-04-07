import { useMutation } from "@tanstack/react-query"

import { useAppStore } from "@/app/store/useAppStore"
import { putAppStateSnapshot } from "@/shared/api"

export function useWorkspaceBoardSync() {
  return useMutation({
    mutationFn: () => {
      const json = useAppStore.getState().exportStateJson()
      return putAppStateSnapshot(JSON.parse(json) as object)
    },
  })
}
