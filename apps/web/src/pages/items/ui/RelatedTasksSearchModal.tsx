import * as Dialog from "@radix-ui/react-dialog"
import { useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type Table,
} from "@tanstack/react-table"
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useAppStore } from "@/app/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import {
  buildRelatedTaskSearchRows,
  type RelatedTaskSearchParams,
  type RelatedTaskSearchRow,
} from "@/entities/item/lib/relatedTasksSearchModel"
import { PRIORITY_VALUES } from "@/entities/item/model/types"
import { TYPE_LABELS } from "@/shared/constants/labels"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"
import { AppModalActions, AppModalBody } from "@/shared/ui/app-modal"
import { ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-dialog-buttons"
import { Heading, modalCloseIconClassName } from "@/shared/ui/typography"
import { filterFieldLabelStyles } from "@/shared/ui/filter-field"
import { cn } from "@/lib/utils"

import styles from "./RelatedTasksSearchModal.module.css"

const FILTER_ALL = "__all__"

const filterLabelClass = cn(
  filterFieldLabelStyles.filterFieldLabel,
  filterFieldLabelStyles.filterFieldLabelGapBelow,
)

const emptyCommitted: RelatedTaskSearchParams = {
  type: "",
  category: "",
  priority: "",
  q: "",
}

const HeaderSelectAll = ({
  table,
}: {
  table: Table<RelatedTaskSearchRow>
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const selection = table.getState().rowSelection
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.indeterminate =
      table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
  }, [table, selection])

  return (
    <input
      ref={ref}
      type="checkbox"
      className={styles.rowCheckbox}
      aria-label="전체 선택"
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  )
}

export type RelatedTasksSearchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (labels: string[]) => void
}

export const RelatedTasksSearchModal = ({
  open,
  onOpenChange,
  onConfirm,
}: RelatedTasksSearchModalProps) => {
  const titleId = useId()
  const items = useAppStore((s) => s.items)
  const domains = useAppStore((s) => s.domains)

  const domainOptions = useMemo(
    () => walkDomainsFlatForClassificationSelect(domains),
    [domains],
  )

  const typeSelectItems = useMemo(() => {
    const items: Record<string, ReactNode> = { [FILTER_ALL]: "전체" }
    for (const t of ITEM_TYPE_VALUES) {
      items[t] = TYPE_LABELS[t] ?? t
    }
    return items
  }, [])

  const categorySelectItems = useMemo(() => {
    const items: Record<string, ReactNode> = { [FILTER_ALL]: "전체" }
    for (const d of domainOptions) {
      items[d.id] = getDomainOptionLabel(domains, d.id)
    }
    return items
  }, [domainOptions, domains])

  const prioritySelectItems = useMemo(() => {
    const items: Record<string, ReactNode> = { [FILTER_ALL]: "전체" }
    for (const p of PRIORITY_VALUES) {
      items[p] = p
    }
    return items
  }, [])

  const [draftType, setDraftType] = useState(FILTER_ALL)
  const [draftCategory, setDraftCategory] = useState(FILTER_ALL)
  const [draftPriority, setDraftPriority] = useState(FILTER_ALL)
  const [draftQ, setDraftQ] = useState("")

  const [committed, setCommitted] = useState<RelatedTaskSearchParams>(emptyCommitted)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    if (!open) return
    setDraftType(FILTER_ALL)
    setDraftCategory(FILTER_ALL)
    setDraftPriority(FILTER_ALL)
    setDraftQ("")
    setCommitted({ ...emptyCommitted })
    setRowSelection({})
  }, [open])

  useEffect(() => {
    setRowSelection({})
  }, [
    committed.type,
    committed.category,
    committed.priority,
    committed.q,
  ])

  const { data = [], isPending, isError, error } = useQuery({
    queryKey: [
      "tasks",
      "related-search",
      committed.type,
      committed.category,
      committed.priority,
      committed.q,
      items,
      domains,
    ],
    queryFn: () => {
      const { items: nextItems, domains: nextDomains } = useAppStore.getState()
      return buildRelatedTaskSearchRows(nextItems, nextDomains, committed)
    },
    enabled: open,
  })

  const columns = useMemo<ColumnDef<RelatedTaskSearchRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => <HeaderSelectAll table={table} />,
        cell: ({ row }) => (
          <input
            type="checkbox"
            className={styles.rowCheckbox}
            aria-label={`${row.original.code} ${row.original.title} 선택`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "type",
        header: "유형",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return TYPE_LABELS[v] ?? v
        },
      },
      {
        accessorKey: "domainName",
        header: "분류",
      },
      {
        accessorKey: "priority",
        header: "우선순위",
      },
      {
        id: "titleCode",
        header: "제목/코드",
        cell: ({ row }) => (
          <span>
            <span className={styles.titleCodeCell}>
              {row.original.code}
              <span className={styles.titleCodeSep}> · </span>
            </span>
            {row.original.title}
          </span>
        ),
      },
    ],
    [],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack useReactTable
  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })

  const handleSearch = () => {
    setCommitted({
      type: draftType === FILTER_ALL ? "" : draftType,
      category: draftCategory === FILTER_ALL ? "" : draftCategory,
      priority: draftPriority === FILTER_ALL ? "" : draftPriority,
      q: draftQ.trim(),
    })
  }

  const handleConfirm = () => {
    const selected = table.getFilteredSelectedRowModel().rows
    const labels = selected.map((r) => `${r.original.code} · ${r.original.title}`)
    onConfirm(labels)
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setRowSelection({})
    onOpenChange(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn("modal", "task-search-modal")}
          aria-labelledby={titleId}
          aria-describedby={undefined}
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading as="h3" variant="modal" id={titleId}>
                Task 검색
              </Heading>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className={modalCloseIconClassName}
                aria-label="닫기"
              >
                ×
              </Button>
            </Dialog.Close>
          </div>

          <AppModalBody className={styles.modalBody}>
            <div className={styles.filterRow}>
              <div className={cn(styles.filterField, styles.filterFieldNarrow)}>
                <label className={filterLabelClass} htmlFor="related-search-type">
                  유형
                </label>
                <Select
                  value={draftType}
                  items={typeSelectItems}
                  onValueChange={(v) => setDraftType(v ?? FILTER_ALL)}
                >
                  <SelectTrigger
                    id="related-search-type"
                    className={styles.filterSelectTrigger}
                  >
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value={FILTER_ALL}>전체</SelectItem>
                    {ITEM_TYPE_VALUES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t] ?? t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn(styles.filterField, styles.filterFieldNarrow)}>
                <label className={filterLabelClass} htmlFor="related-search-category">
                  분류
                </label>
                <Select
                  value={draftCategory}
                  items={categorySelectItems}
                  onValueChange={(v) => setDraftCategory(v ?? FILTER_ALL)}
                >
                  <SelectTrigger
                    id="related-search-category"
                    className={styles.filterSelectTrigger}
                  >
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value={FILTER_ALL}>전체</SelectItem>
                    {domainOptions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {getDomainOptionLabel(domains, d.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn(styles.filterField, styles.filterFieldNarrow)}>
                <label className={filterLabelClass} htmlFor="related-search-priority">
                  우선순위
                </label>
                <Select
                  value={draftPriority}
                  items={prioritySelectItems}
                  onValueChange={(v) => setDraftPriority(v ?? FILTER_ALL)}
                >
                  <SelectTrigger
                    id="related-search-priority"
                    className={styles.filterSelectTrigger}
                  >
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value={FILTER_ALL}>전체</SelectItem>
                    {PRIORITY_VALUES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={cn(styles.filterField, styles.filterFieldTitleCode)}>
                <label className={filterLabelClass} htmlFor="related-search-q">
                  제목/코드
                </label>
                <Input
                  id="related-search-q"
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value)}
                  placeholder="제목/코드를 입력해 주세요"
                  className={styles.filterTextInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
              </div>

              <Button type="button" className={styles.searchButton} onClick={handleSearch}>
                검색
              </Button>
            </div>

            <div className={styles.tableSection}>
              {isPending ? (
                <p className={styles.loadingState}>불러오는 중…</p>
              ) : isError ? (
                <p className={styles.errorState} role="alert">
                  {(error as Error)?.message ?? "목록을 불러오지 못했습니다."}
                </p>
              ) : (
                <UiTable>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className={styles.emptyState}
                        >
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </UiTable>
              )}
            </div>

            <AppModalActions className={styles.footerActions}>
              <Dialog.Close asChild>
                <ModalSecondaryButton actionSize="fixedMd" type="button">
                  취소
                </ModalSecondaryButton>
              </Dialog.Close>
              <ModalPrimaryButton
                type="button"
                actionSize="fixedMd"
                onClick={handleConfirm}
              >
                확인
              </ModalPrimaryButton>
            </AppModalActions>
          </AppModalBody>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
