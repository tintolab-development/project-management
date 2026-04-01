import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar"
import { TopBar } from "@/widgets/top-bar/TopBar"

export const AppShellLayout = () => (
  <div className="app-shell">
    <AppSidebar />
    <main className="main">
      <TopBar />
      <Outlet />
    </main>
  </div>
)
