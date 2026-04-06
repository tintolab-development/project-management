import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { lazy, Suspense, useState, type ReactNode } from "react"

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : () => null

export function AppProviders({ children }: { children: ReactNode }) {
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
      {children}
      {import.meta.env.DEV ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  )
}
