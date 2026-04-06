import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@/app/styles/shadcn.css"
import "@/app/styles/tokens.css"
import "@/app/styles/global.css"
import { AppProviders } from "@/app/providers/AppProviders"
import { AppRoutes } from "@/app/AppRoutes"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
)
