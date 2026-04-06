import { Route, Routes } from "react-router-dom"
import { RequireAuth } from "@/app/RequireAuth"
import { AppShellLayout } from "@/widgets/app-shell/AppShellLayout"
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage"
import { WorkspacesPage } from "@/pages/workspaces/ui/WorkspacesPage"
import { ItemsPage } from "@/pages/items/ui/ItemsPage"
import { TreePage } from "@/pages/tree/ui/TreePage"
import { CalendarPage } from "@/pages/calendar/ui/CalendarPage"
import { LoginPage } from "@/pages/login/ui/LoginPage"

export const AppRoutes = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />

    <Route element={<RequireAuth />}>
      <Route element={<AppShellLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="tree" element={<TreePage />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
    </Route>
  </Routes>
)
