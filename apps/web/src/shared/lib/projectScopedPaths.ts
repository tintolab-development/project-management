import { useProjectRouteSlug } from "./projectRouteSlug"

/**
 * `/project/:projectSlug/*` 하위 페이지에서 내부 이동 시 접두 경로를 맞춥니다.
 * `projectSlug`가 없으면 레거시 루트 경로로 폴백해 `LegacyPathRedirect`가 처리할 수 있게 합니다.
 */
export const useProjectScopedPaths = () => {
  const slug = useProjectRouteSlug()
  const base = slug ? `/project/${slug}` : ""

  return {
    projectSlug: slug,
    base,
    dashboard: base ? `${base}/dashboard` : "/",
    workspaces: base ? `${base}/workspaces` : "/workspaces",
    tasks: base ? `${base}/tasks` : "/tasks",
    taskNew: base ? `${base}/tasks/new` : "/tasks/new",
    taskDetail: (itemId: string) =>
      base ? `${base}/tasks/${encodeURIComponent(itemId)}` : `/tasks/${encodeURIComponent(itemId)}`,
    tree: base ? `${base}/tree` : "/tree",
    calendar: base ? `${base}/calendar` : "/calendar",
  }
}
