import { useLocation, useParams } from "react-router-dom"

/** `/project/:slug/...` 경로에서 슬러그만 추출 */
const PROJECT_SLUG_FROM_PATH = /^\/project\/([^/]+)(?:\/|$)/

/**
 * `project/:projectSlug` 하위에서 슬러그를 반환합니다.
 * 레이아웃·중첩 라우트에서 `useParams()`가 `projectSlug`를 비우는 경우가 있어
 * `location.pathname`으로 보조합니다. (없으면 빈 문자열)
 */
export const useProjectRouteSlug = (): string => {
  const { projectSlug: paramSlug } = useParams<{ projectSlug?: string }>()
  const { pathname } = useLocation()
  const fromParams = paramSlug?.trim() ?? ""
  if (fromParams) return fromParams
  const m = pathname.match(PROJECT_SLUG_FROM_PATH)
  return m?.[1]?.trim() ?? ""
}
