import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAppStore, type TasksListFiltersPayload } from "@/app/store/useAppStore"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import { itemMatchesSearch } from "@/shared/lib/itemSearch"
import { TasksFilterPanel } from "./TasksFilterPanel"
import { TasksResultCard } from "./TasksResultCard"
import { TasksPagination } from "./TasksPagination"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Text } from "@/shared/ui/typography"

import pageStyles from "./ItemsPage.module.css"
import {
  mergeTasksListIntoSearchParams,
  serializeTasksListSearchParams,
} from "../lib/tasksListSearchParams"

const PAGE_SIZE = 10

const EMPTY_TASKS_LIST_FILTERS: TasksListFiltersPayload = {
  itemsQuery: "",
  priorityFilters: [],
  typeFilters: [],
  domainFilter: "",
  ownerFilter: "",
}

export const ItemsPage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [tasksFilterPanelKey, setTasksFilterPanelKey] = useState(0)

  const domains = useAppStore((s) => s.domains)
  const itemsQuery = useAppStore((s) => s.ui.itemsQuery)
  const typeFilters = useAppStore((s) => s.ui.typeFilters)
  const domainFilter = useAppStore((s) => s.ui.domainFilter)
  const statusFilter = useAppStore((s) => s.ui.statusFilter)
  const priorityFilters = useAppStore((s) => s.ui.priorityFilters)
  const dueDateFilter = useAppStore((s) => s.ui.dueDateFilter)
  const ownerFilter = useAppStore((s) => s.ui.ownerFilter)
  const selectItem = useAppStore((s) => s.selectItem)
  const getSortedItems = useAppStore((s) => s.getSortedItems)
  const applyTasksListFilters = useAppStore((s) => s.applyTasksListFilters)
  const setItemsQuery = useAppStore((s) => s.setItemsQuery)

  /**
   * Tasks 이탈 시 URL을 여기서 `setSearchParams`로 건드리면 안 됨.
   * 라우트 전환 직후 언마운트 cleanup에서 `replace`가 새 내비게이션과 경합해
   * 다시 `/tasks`로 돌아가거나 다른 라우트 진입이 막히는 문제가 난다.
   * 검색어는 스토어만 비우고, 쿼리 정리는 다음에 Tasks로 올 때 URL·필터 패널이 맡긴다.
   */
  useEffect(() => {
    return () => {
      setItemsQuery("")
    }
  }, [setItemsQuery])

  /** 목록 진입 시 시트·상세에서 남은 선택 상태 제거 */
  useEffect(() => {
    selectItem(null)
  }, [selectItem])

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.id, d])),
    [domains],
  )
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const sorted = getSortedItems()

  const filtered = useMemo(() => {
    const domainLabel = (id: string) => domainMap.get(id)?.name || id || "-"
    return sorted.filter((item) => {
      return (
        itemMatchesSearch(item, itemsQuery, domainLabel) &&
        (!typeFilters.length || typeFilters.includes(item.type)) &&
        (!domainFilter || item.domain === domainFilter) &&
        (!statusFilter || item.status === statusFilter) &&
        (!priorityFilters.length ||
          priorityFilters.includes(item.priority)) &&
        (!dueDateFilter || item.dueDate === dueDateFilter) &&
        (!ownerFilter.trim() ||
          item.owner.trim() === ownerFilter.trim())
      )
    })
  }, [
    sorted,
    itemsQuery,
    typeFilters,
    domainFilter,
    statusFilter,
    priorityFilters,
    dueDateFilter,
    ownerFilter,
    domainMap,
  ])

  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        itemsQuery,
        typeFilters,
        priorityFilters,
        domainFilter,
        ownerFilter,
        statusFilter,
        dueDateFilter,
      }),
    [
      itemsQuery,
      typeFilters,
      priorityFilters,
      domainFilter,
      ownerFilter,
      statusFilter,
      dueDateFilter,
    ],
  )

  const [prevFilterSignature, setPrevFilterSignature] =
    useState(filterSignature)

  const totalPages =
    filtered.length === 0 ? 0 : Math.ceil(filtered.length / PAGE_SIZE)

  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  } else if (totalPages > 0 && page > totalPages) {
    setPage(totalPages)
  }

  const safePage = Math.min(
    page,
    Math.max(1, totalPages || 1),
  )

  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const handleOpenTask = (itemId: string) => {
    navigate(paths.taskDetail(itemId))
  }

  const handleResetTaskFilters = () => {
    applyTasksListFilters(EMPTY_TASKS_LIST_FILTERS)
    const merged = mergeTasksListIntoSearchParams(
      searchParams,
      serializeTasksListSearchParams(EMPTY_TASKS_LIST_FILTERS),
    )
    setSearchParams(merged, { replace: true })
    setPage(1)
    setTasksFilterPanelKey((k) => k + 1)
  }

  const showTaskFilterReset =
    filtered.length === 0 && sorted.length > 0

  return (
    <section className={pageStyles.itemsLayout} aria-label="작업 검색 및 목록">
      <Card variant="panel" className={pageStyles.filterPanel}>
        <div className={pageStyles.filterPanelScroll}>
          <TasksFilterPanel
            key={tasksFilterPanelKey}
            domains={domains}
            onFiltersApplied={() => setPage(1)}
          />
        </div>
      </Card>

      <Card variant="panel" className={pageStyles.resultsPanel}>
        <div className={pageStyles.resultsBody}>
          <div className={pageStyles.tasksToolbar}>
            <span className={pageStyles.tasksToolbarCount}>
              {filtered.length} Tasks
            </span>
            <Button
              type="button"
              appearance="fill"
              dimension="fixedMd"
              onClick={() => navigate(paths.taskNew)}
            >
              태스크 추가
            </Button>
          </div>

          <div className={pageStyles.tasksCardList}>
            {pageSlice.map((row) => (
              <TasksResultCard
                key={row.id}
                item={row}
                getDomainLabel={getDomainLabel}
                onOpen={handleOpenTask}
              />
            ))}
            {filtered.length === 0 ? (
              <div className={pageStyles.tasksEmpty}>
                <Text as="div" variant="emptyDetail">
                  조건에 맞는 작업이 없습니다.
                </Text>
                {showTaskFilterReset ? (
                  <Button
                    type="button"
                    variant="outline"
                    dimension="fixedMd"
                    onClick={handleResetTaskFilters}
                    aria-label="작업 목록 필터 초기화"
                  >
                    필터 초기화
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            <div className={pageStyles.tasksPagination}>
              <TasksPagination
                currentPage={safePage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  )
}
