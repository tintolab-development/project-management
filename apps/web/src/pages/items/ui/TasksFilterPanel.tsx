import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react"
import { useSearchParams } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import type { Domain } from "@/entities/domain/model/types"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import { PRIORITY_VALUES, type ItemType, type Priority } from "@/entities/item/model/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FilterSelectField, filterFieldLabelStyles } from "@/shared/ui/filter-field"
import { TYPE_LABELS } from "@/shared/constants/labels"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"
import { cn } from "@/lib/utils"

import {
  hasTasksListSearchParams,
  mergeTasksListIntoSearchParams,
  normalizePriorityFilters,
  normalizeTypeFilters,
  parseTasksListSearchParams,
  serializeTasksListSearchParams,
} from "../lib/tasksListSearchParams"
import styles from "./TasksFilterPanel.module.css"

const EMPTY_TASKS_FILTERS = {
  itemsQuery: "",
  priorityFilters: [] as Priority[],
  typeFilters: [] as ItemType[],
  domainFilter: "",
  ownerFilter: "",
}

const PRIORITY_OPTIONS: Priority[] = [...PRIORITY_VALUES]

type TasksFilterPanelProps = {
  domains: Domain[]
  onFiltersApplied?: () => void
}

export const TasksFilterPanel = ({ domains, onFiltersApplied }: TasksFilterPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const items = useAppStore((s) => s.items)
  const applyTasksListFilters = useAppStore((s) => s.applyTasksListFilters)

  const [draftQuery, setDraftQuery] = useState(() => useAppStore.getState().ui.itemsQuery)
  const [draftPriorities, setDraftPriorities] = useState<Priority[]>(() => [
    ...useAppStore.getState().ui.priorityFilters,
  ])
  const [draftTypes, setDraftTypes] = useState<ItemType[]>(() => [
    ...useAppStore.getState().ui.typeFilters,
  ])
  const [draftDomain, setDraftDomain] = useState(() => useAppStore.getState().ui.domainFilter)
  const [draftOwner, setDraftOwner] = useState(() => useAppStore.getState().ui.ownerFilter)

  const prevHadUrlTaskParamsRef = useRef(false)
  const tasksUrlSignature = searchParams.toString()

  useEffect(() => {
    const apply = useAppStore.getState().applyTasksListFilters
    queueMicrotask(() => {
      const sp = new URLSearchParams(tasksUrlSignature)
      const hasUrl = hasTasksListSearchParams(sp)

      if (hasUrl) {
        const p = parseTasksListSearchParams(sp)
        apply(p)
        setDraftQuery(p.itemsQuery)
        setDraftPriorities([...p.priorityFilters])
        setDraftTypes([...p.typeFilters])
        setDraftDomain(p.domainFilter)
        setDraftOwner(p.ownerFilter)
        prevHadUrlTaskParamsRef.current = true
        return
      }

      if (prevHadUrlTaskParamsRef.current) {
        apply(EMPTY_TASKS_FILTERS)
        setDraftQuery("")
        setDraftPriorities([])
        setDraftTypes([])
        setDraftDomain("")
        setDraftOwner("")
        prevHadUrlTaskParamsRef.current = false
      }
    })
  }, [tasksUrlSignature])

  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchId = useId()
  const domainSelectId = useId()
  const ownerSelectId = useId()

  const domainOptions = useMemo(
    () =>
      walkDomainsFlatForClassificationSelect(domains).map((d) => ({
        value: d.id,
        label: getDomainOptionLabel(domains, d.id),
      })),
    [domains]
  )

  const ownerOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const item of items) {
      const o = item.owner?.trim()
      if (o) seen.add(o)
    }
    return [...seen].sort((a, b) => a.localeCompare(b, "ko"))
  }, [items])

  const ownerSelectOptions = useMemo(
    () => ownerOptions.map((o) => ({ value: o, label: o })),
    [ownerOptions]
  )

  const handleTogglePriority = (p: Priority) => {
    setDraftPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const handleClearPriorities = () => {
    setDraftPriorities([])
  }

  const handleToggleType = (t: ItemType) => {
    setDraftTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const handleClearTypes = () => {
    setDraftTypes([])
  }

  const handleSubmitSearch = () => {
    const payload = {
      itemsQuery: draftQuery,
      priorityFilters: normalizePriorityFilters(draftPriorities),
      typeFilters: normalizeTypeFilters(draftTypes),
      domainFilter: draftDomain,
      ownerFilter: draftOwner,
    }
    applyTasksListFilters(payload)
    const taskParams = serializeTasksListSearchParams(payload)
    const merged = mergeTasksListIntoSearchParams(searchParams, taskParams)
    setSearchParams(merged, { replace: true })
    onFiltersApplied?.()
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSubmitSearch()
  }

  const handleSearchFieldPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const input = searchInputRef.current
    if (!input) return
    const t = e.target as Node
    if (t === input || input.contains(t)) return
    e.preventDefault()
    input.focus()
  }

  return (
    <form className={styles.panel} aria-label="작업 검색 및 필터" onSubmit={handleFormSubmit}>
      <div className={styles.searchFieldDividerColumn}>
        <div className={styles.field} onPointerDown={handleSearchFieldPointerDown}>
          <label className={filterFieldLabelStyles.filterFieldLabel} htmlFor={searchId}>
            제목/코드
          </label>
          <div className={styles.searchShell}>
            <Input
              ref={searchInputRef}
              id={searchId}
              type="search"
              className={cn(
                styles.searchInput,
                "h-auto min-h-[var(--filter-control-height)] rounded-[var(--filter-control-radius)] border-0 bg-transparent shadow-none focus-visible:ring-0"
              )}
              placeholder="제목이나 코드를 검색해 주세요"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              aria-label="제목 또는 코드 검색"
            />
          </div>
        </div>

        <Separator orientation="horizontal" className={styles.panelDivider} />
      </div>

      <div className={styles.filterRestBlock}>
        <div className={styles.field}>
          <div
            className={filterFieldLabelStyles.filterFieldLabel}
            id={`${searchId}-priority-label`}
          >
            우선순위
          </div>
          <div
            className={styles.badgeRow}
            role="group"
            aria-labelledby={`${searchId}-priority-label`}
          >
            <button
              type="button"
              className={styles.badgeBtn}
              aria-label={
                draftPriorities.length === 0
                  ? "우선순위 전체(필터 없음), 선택됨"
                  : "우선순위 전체(필터 없음), 선택 해제됨"
              }
              onClick={handleClearPriorities}
            >
              <Badge variant={draftPriorities.length === 0 ? "itemListActive" : "itemListInactive"}>
                전체
              </Badge>
            </button>
            {PRIORITY_OPTIONS.map((p) => {
              const on = draftPriorities.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  className={styles.badgeBtn}
                  aria-label={`우선순위 ${p}, ${on ? "선택됨" : "선택 안 함"}`}
                  onClick={() => handleTogglePriority(p)}
                >
                  <Badge variant={on ? "itemListActive" : "itemListInactive"}>{p}</Badge>
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.field}>
          <div className={filterFieldLabelStyles.filterFieldLabel} id={`${searchId}-type-label`}>
            유형
          </div>
          <div className={styles.badgeRow} role="group" aria-labelledby={`${searchId}-type-label`}>
            <button
              type="button"
              className={styles.badgeBtn}
              aria-label={
                draftTypes.length === 0
                  ? "유형 전체(필터 없음), 선택됨"
                  : "유형 전체(필터 없음), 선택 해제됨"
              }
              onClick={handleClearTypes}
            >
              <Badge variant={draftTypes.length === 0 ? "itemListActive" : "itemListInactive"}>
                전체
              </Badge>
            </button>
            {ITEM_TYPE_VALUES.map((t) => {
              const on = draftTypes.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  className={styles.badgeBtn}
                  aria-label={`유형 ${TYPE_LABELS[t]}, ${on ? "선택됨" : "선택 안 함"}`}
                  onClick={() => handleToggleType(t)}
                >
                  <Badge variant={on ? "itemListActive" : "itemListInactive"}>
                    {TYPE_LABELS[t]}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        <FilterSelectField
          controlId={domainSelectId}
          label="분류"
          placeholder="분류를 선택해 주세요"
          options={domainOptions}
          value={draftDomain}
          onValueChange={setDraftDomain}
          resolveDisplayLabel={(id) => getDomainOptionLabel(domains, id)}
          fullWidth
        />

        <FilterSelectField
          controlId={ownerSelectId}
          label="프로젝트 담당자"
          placeholder="프로젝트 담당자를 선택해 주세요"
          options={ownerSelectOptions}
          value={draftOwner}
          onValueChange={setDraftOwner}
          fullWidth
        />

        <Button type="submit" variant="default" className={styles.submitBtn}>
          조회
        </Button>
      </div>
    </form>
  )
}
