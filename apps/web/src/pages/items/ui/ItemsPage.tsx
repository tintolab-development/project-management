import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import { postItemComment, syncMockAppStateFromStore } from "@/shared/api"
import type { Item } from "@/entities/item/model/types"
import type { ItemStatus } from "@/shared/constants/labels"
import { STATUS_VALUES } from "@/shared/constants/labels"
import { walkDomainsFlatForClassificationSelect } from "@/entities/domain/lib/domainTree"
import { itemMatchesSearch } from "@/shared/lib/itemSearch"
import { TasksFilterPanel } from "./TasksFilterPanel"
import { ItemDetailForm, type DetailForm } from "./ItemDetailForm"
import { TasksResultCard } from "./TasksResultCard"
import { TasksPagination } from "./TasksPagination"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { panelHeadStyles } from "@/shared/ui/page-chrome"
import { Heading, Text } from "@/shared/ui/typography"

import pageStyles from "./ItemsPage.module.css"

const PAGE_SIZE = 10

const getStatusOptionsForItem = (current: Item | undefined): ItemStatus[] => {
  if (!current) return [...STATUS_VALUES]
  if (current.status === "확정") return ["확정"]
  if (current.status === "방향합의")
    return ["논의", "방향합의", "확정"]
  return ["논의", "방향합의"]
}

export const ItemsPage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()
  const [page, setPage] = useState(1)

  const domains = useAppStore((s) => s.domains)
  const allItems = useAppStore((s) => s.items)
  const itemsQuery = useAppStore((s) => s.ui.itemsQuery)
  const typeFilters = useAppStore((s) => s.ui.typeFilters)
  const domainFilter = useAppStore((s) => s.ui.domainFilter)
  const statusFilter = useAppStore((s) => s.ui.statusFilter)
  const priorityFilters = useAppStore((s) => s.ui.priorityFilters)
  const dueDateFilter = useAppStore((s) => s.ui.dueDateFilter)
  const ownerFilter = useAppStore((s) => s.ui.ownerFilter)
  const selectedItemId = useAppStore((s) => s.ui.selectedItemId)
  const comments = useAppStore((s) => s.comments)
  const history = useAppStore((s) => s.history)

  const selectItem = useAppStore((s) => s.selectItem)
  const getSortedItems = useAppStore((s) => s.getSortedItems)
  const saveSelectedItem = useAppStore((s) => s.saveSelectedItem)
  const toggleLockSelectedItem = useAppStore((s) => s.toggleLockSelectedItem)
  const addCommentFromApi = useAppStore((s) => s.addCommentFromApi)

  const syncMockAfterMutation = () => {
    void syncMockAppStateFromStore().catch((err) => {
      console.error("[items] mock app-state sync failed", err)
    })
  }

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

  useEffect(() => {
    if (!filtered.length) {
      if (selectedItemId !== null) selectItem(null)
      return
    }
    if (
      selectedItemId &&
      !filtered.some((item) => item.id === selectedItemId)
    ) {
      selectItem(null)
    }
  }, [filtered, selectedItemId, selectItem])

  const item = allItems.find((i) => i.id === selectedItemId)
  const selected = item ?? undefined

  const locked = selected
    ? selected.status === "확정" || selected.isLocked
    : false

  const detailTitleTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const { register, handleSubmit, control } = useForm<DetailForm>({
    values: selected
      ? {
          title: selected.title,
          domain: selected.domain,
          priority: selected.priority,
          status: selected.status,
          owner: selected.owner,
          dueDate: selected.dueDate,
          description: selected.description,
          clientResponse: selected.clientResponse,
          finalConfirmedValue: selected.finalConfirmedValue,
        }
      : {
          title: "",
          domain: walkDomainsFlatForClassificationSelect(domains)[0]?.id ?? "",
          priority: "P1",
          status: "논의",
          owner: "",
          dueDate: "",
          description: "",
          clientResponse: "",
          finalConfirmedValue: "",
        },
  })

  const ownerWatched = useWatch({ control, name: "owner" })
  const titleWatched = useWatch({ control, name: "title" })
  const commentAuthor = ownerWatched?.trim() || "틴토랩 PM"

  const syncDetailTitleHeight = () => {
    const el = detailTitleTextareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  useLayoutEffect(() => {
    syncDetailTitleHeight()
  }, [selected?.id, titleWatched])

  const titleField = register("title")

  const handleDetailTitleRef = (el: HTMLTextAreaElement | null) => {
    detailTitleTextareaRef.current = el
  }

  const handleDetailTitleInput = () => {
    syncDetailTitleHeight()
  }

  const onSave = handleSubmit((data) => {
    const ok = saveSelectedItem({
      title: data.title,
      domain: data.domain,
      priority: data.priority,
      status: data.status,
      owner: data.owner,
      dueDate: data.dueDate,
      description: data.description,
      clientResponse: data.clientResponse,
      finalConfirmedValue: data.finalConfirmedValue,
    })
    if (ok) syncMockAfterMutation()
  })

  const handleAddCommentWithSync = async (author: string, body: string) => {
    if (!selectedItemId) return false
    const aid = author.trim()
    const bid = body.trim()
    if (!aid || !bid) {
      window.alert("작성자와 코멘트 내용을 입력해 주세요.")
      return false
    }
    try {
      const comment = await postItemComment(selectedItemId, {
        author: aid,
        body: bid,
      })
      const ok = addCommentFromApi(comment)
      if (ok) syncMockAfterMutation()
      return ok
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "코멘트 저장 요청에 실패했습니다.",
      )
      return false
    }
  }

  const handleToggleLockWithSync = () => {
    const ok = toggleLockSelectedItem()
    if (ok) syncMockAfterMutation()
  }

  const itemComments = selected
    ? comments
        .filter((c) => c.itemId === selected.id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
    : []

  const itemHistory = selected
    ? history
        .filter((h) => h.itemId === selected.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
    : []

  const statusOptions = getStatusOptionsForItem(selected)

  const handleOpenTask = (itemId: string) => {
    selectItem(itemId)
  }

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) selectItem(null)
  }

  return (
    <section className={pageStyles.itemsLayout} aria-label="작업 검색 및 목록">
      <Card variant="panel" className={pageStyles.filterPanel}>
        <div className={panelHeadStyles.panelHead}>
          <Heading as="h3" variant="panel">
            필터
          </Heading>
        </div>

        <TasksFilterPanel
          domains={domains}
          onFiltersApplied={() => setPage(1)}
        />
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
                selected={row.id === selectedItemId}
                onOpen={handleOpenTask}
              />
            ))}
            {filtered.length === 0 ? (
              <Text as="div" variant="emptyDetail" className={pageStyles.tasksEmpty}>
                조건에 맞는 작업이 없습니다.
              </Text>
            ) : null}
          </div>

          {totalPages > 1 ? (
            <div className={pageStyles.tasksPagination}>
              <TasksPagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </Card>

      <Sheet open={Boolean(selected)} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className="w-full max-w-none overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Item 상세</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className={pageStyles.sheetContentInner}>
              <ItemDetailForm
                selected={selected}
                locked={locked}
                domains={domains}
                getDomainLabel={getDomainLabel}
                statusOptions={statusOptions}
                titleField={titleField}
                handleDetailTitleRef={handleDetailTitleRef}
                handleDetailTitleInput={handleDetailTitleInput}
                register={register}
                onSubmit={onSave}
                itemComments={itemComments}
                itemHistory={itemHistory}
                commentAuthor={commentAuthor}
                addComment={handleAddCommentWithSync}
                toggleLockSelectedItem={handleToggleLockWithSync}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

    </section>
  )
}
