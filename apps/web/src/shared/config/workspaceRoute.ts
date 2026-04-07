export const WORKSPACE_QUERY_KEY = "workspace"

export type WorkspaceTabParam = "information_request" | "decision"

export function parseWorkspaceTabParam(
  value: string | null,
): WorkspaceTabParam | null {
  if (value === "information_request" || value === "decision") return value
  return null
}

export function buildWorkspacesPath(
  active: WorkspaceTabParam,
  opts?: { projectBasePath?: string },
): string {
  const q = new URLSearchParams()
  q.set(WORKSPACE_QUERY_KEY, active)
  const base = opts?.projectBasePath?.replace(/\/$/, "") ?? ""
  const path = base ? `${base}/workspaces` : "/workspaces"
  return `${path}?${q.toString()}`
}
