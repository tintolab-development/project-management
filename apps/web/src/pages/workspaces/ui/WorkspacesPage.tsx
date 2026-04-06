import { useCallback, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppStore } from "@/app/store/useAppStore"
import { getDomainMap } from "@/entities/domain/lib/domainTree"
import { sortItemsForGlobalList } from "@/entities/item/lib/sortItemsByBoard"
import {
  filterItemsByWorkspaceSelections,
  hasWorkspaceFiltersActive,
  mergeWorkspaceFiltersIntoParams,
  readWorkspaceFilterSelections,
  type WorkspaceFilterSelections,
} from "@/shared/config/workspaceFilterParams"
import {
  WORKSPACE_QUERY_KEY,
  parseWorkspaceTabParam,
} from "@/shared/config/workspaceRoute"
import { WorkspaceBoard } from "@/widgets/workspace-board"

import { WorkspaceFiltersRow } from "./WorkspaceFiltersRow"

export const WorkspacesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeWorkspace = useAppStore((s) => s.ui.activeWorkspace)
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace)
  const domains = useAppStore((s) => s.domains)
  const selectItem = useAppStore((s) => s.selectItem)
  const itemsRaw = useAppStore((s) => s.items)

  const items = useMemo(
    () => sortItemsForGlobalList(itemsRaw),
    [itemsRaw],
  )
  const domainMap = getDomainMap(domains)
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const selections = useMemo(
    () => readWorkspaceFilterSelections(searchParams),
    [searchParams],
  )

  const setFilterSelections = useCallback(
    (next: WorkspaceFilterSelections) => {
      setSearchParams(mergeWorkspaceFiltersIntoParams(searchParams, next), {
        replace: true,
      })
    },
    [searchParams, setSearchParams],
  )

  const workspaceItems = useMemo(
    () =>
      filterItemsByWorkspaceSelections(items, activeWorkspace, selections),
    [items, activeWorkspace, selections],
  )

  useEffect(() => {
    const parsed = parseWorkspaceTabParam(
      searchParams.get(WORKSPACE_QUERY_KEY),
    )
    if (parsed) {
      setActiveWorkspace(parsed)
      return
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(WORKSPACE_QUERY_KEY, activeWorkspace)
        return next
      },
      { replace: true },
    )
  }, [searchParams, activeWorkspace, setActiveWorkspace, setSearchParams])

  const handleOpenItem = (itemId: string) => {
    selectItem(itemId)
    navigate("/items")
  }

  const dndDisabled = hasWorkspaceFiltersActive(selections)

  return (
    <section aria-label="워크스페이스">
      <WorkspaceFiltersRow
        items={items}
        domains={domains}
        selections={selections}
        onSelectionsChange={setFilterSelections}
      />
      <WorkspaceBoard
        workspaceItems={workspaceItems}
        dndDisabled={dndDisabled}
        getDomainLabel={getDomainLabel}
        onOpenItem={handleOpenItem}
      />
    </section>
  )
}
