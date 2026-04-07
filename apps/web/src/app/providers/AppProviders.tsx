import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"

import { useAuthSessionStore } from "@/features/auth"
import { setHttpClientAuthTokenGetter } from "@/shared/api"
import { AppDialogHost } from "@/shared/ui/app-dialog-host"
import { TooltipProvider } from "@/shared/ui/tooltip"

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    setHttpClientAuthTokenGetter(() => useAuthSessionStore.getState().accessToken)
  }, [])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: import.meta.env.PROD,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <AppDialogHost />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
