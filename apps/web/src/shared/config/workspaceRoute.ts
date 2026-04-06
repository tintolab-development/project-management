export const WORKSPACE_QUERY_KEY = "workspace"

export type WorkspaceTabParam = "information_request" | "decision"

export function parseWorkspaceTabParam(
  value: string | null,
): WorkspaceTabParam | null {
  if (value === "information_request" || value === "decision") return value
  return null
}

export function buildWorkspacesPath(active: WorkspaceTabParam): string {
  const q = new URLSearchParams()
  q.set(WORKSPACE_QUERY_KEY, active)
  return `/workspaces?${q.toString()}`
}
