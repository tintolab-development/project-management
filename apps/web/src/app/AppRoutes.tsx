import { Route, Routes } from "react-router-dom"
import { AppShellLayout } from "@/widgets/app-shell/AppShellLayout"
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage"
import { WorkspacesPage } from "@/pages/workspaces/ui/WorkspacesPage"
import { ItemsPage } from "@/pages/items/ui/ItemsPage"
import { TreePage } from "@/pages/tree/ui/TreePage"
import { CalendarPage } from "@/pages/calendar/ui/CalendarPage"

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppShellLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="workspaces" element={<WorkspacesPage />} />
      <Route path="items" element={<ItemsPage />} />
      <Route path="tree" element={<TreePage />} />
      <Route path="calendar" element={<CalendarPage />} />
    </Route>
  </Routes>
)
