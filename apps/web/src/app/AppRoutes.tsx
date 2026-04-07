import { Navigate, Route, Routes } from "react-router-dom"
import {
  LegacyPPathPrefixRedirect,
  LegacyPathRedirect,
} from "@/app/LegacyPathRedirect"
import { PostLoginIndexRedirect } from "@/app/PostLoginIndexRedirect"
import { RequireAdmin } from "@/app/RequireAdmin"
import { RequireAuth } from "@/app/RequireAuth"
import { RequireProjectAccess } from "@/app/RequireProjectAccess"
import { AppShellLayout } from "@/widgets/app-shell/AppShellLayout"
import { AdminAccountsPage } from "@/pages/admin/ui/AdminAccountsPage"
import { AdminLogsPage } from "@/pages/admin/ui/AdminLogsPage"
import { AdminProjectsPage } from "@/pages/admin/ui/AdminProjectsPage"
import { AdminSchedulePage } from "@/pages/admin/ui/AdminSchedulePage"
import { CalendarPage } from "@/pages/calendar/ui/CalendarPage"
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage"
import { ItemsPage } from "@/pages/items/ui/ItemsPage"
import { TaskCreatePage } from "@/pages/items/ui/TaskCreatePage"
import { LoginPage } from "@/pages/login/ui/LoginPage"
import { NoProjectAssignedPage } from "@/pages/no-project-assigned/ui/NoProjectAssignedPage"
import { TreePage } from "@/pages/tree/ui/TreePage"
import { WorkspacesPage } from "@/pages/workspaces/ui/WorkspacesPage"

export const AppRoutes = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />

    <Route element={<RequireAuth />}>
      <Route index element={<PostLoginIndexRedirect />} />
      <Route path="no-project-assigned" element={<NoProjectAssignedPage />} />

      <Route element={<RequireAdmin />}>
        <Route element={<AppShellLayout variant="admin" />}>
          <Route path="admin">
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="accounts" element={<AdminAccountsPage />} />
            <Route path="schedule" element={<AdminSchedulePage />} />
            <Route path="logs" element={<AdminLogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="p/*" element={<LegacyPPathPrefixRedirect />} />

      <Route path="project/:projectSlug" element={<RequireProjectAccess />}>
        <Route element={<AppShellLayout variant="project" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="tasks/new" element={<TaskCreatePage />} />
          <Route path="tasks/:itemId" element={<TaskCreatePage />} />
          <Route path="tasks" element={<ItemsPage />} />
          <Route path="items" element={<Navigate to="tasks" replace />} />
          <Route path="tree" element={<TreePage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
      </Route>

      <Route path="workspaces" element={<LegacyPathRedirect />} />
      <Route path="tasks/new" element={<LegacyPathRedirect />} />
      <Route path="tasks/:itemId" element={<LegacyPathRedirect />} />
      <Route path="tasks" element={<LegacyPathRedirect />} />
      <Route path="items" element={<LegacyPathRedirect />} />
      <Route path="tree" element={<LegacyPathRedirect />} />
      <Route path="calendar" element={<LegacyPathRedirect />} />
    </Route>
  </Routes>
)
