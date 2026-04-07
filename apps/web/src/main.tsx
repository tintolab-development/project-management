import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@/app/styles/tokens.css"
import "@/app/styles/shadcn.css"
import "@/app/styles/global.css"
import { AppProviders } from "@/app/providers/AppProviders"
import { AppRoutes } from "@/app/AppRoutes"

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MSW !== "false") {
    const { enableMsw } = await import("@/app/mocks/enableMsw")
    await enableMsw()
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </StrictMode>,
  )
}

void bootstrap()
