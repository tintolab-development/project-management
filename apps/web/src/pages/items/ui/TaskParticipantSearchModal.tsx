import * as Dialog from "@radix-ui/react-dialog"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table"
import { type ReactNode, useEffect, useId, useMemo, useState } from "react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  participantToAssigneeLabel,
  useProjectParticipantsQuery,
  type ProjectParticipant,
} from "@/shared/api/projectParticipants"
import { PROJECT_PARTICIPANT_AFFILIATION_OPTIONS } from "@/shared/lib/projectParticipantsSeed"
import { AppModalActions, AppModalBody } from "@/shared/ui/app-modal"
import { appModalStyles } from "@/shared/ui/app-modal"
import { ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-dialog-buttons"
import { filterFieldLabelStyles } from "@/shared/ui/filter-field"
import { headingVariants, modalCloseIconClassName } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

import styles from "./TaskParticipantSearchModal.module.css"

const AFFILIATION_ALL = "__participant_affiliation_all__"

/** `data ?? []`는 매 렌더마다 새 참조가 되어 effect가 무한 루프를 일으키므로 모듈 단일 배열 사용 */
const EMPTY_PARTICIPANTS: ProjectParticipant[] = []

const filterLabelClass = cn(
  filterFieldLabelStyles.filterFieldLabel,
  filterFieldLabelStyles.filterFieldLabelGapBelow,
)

export type TaskParticipantSearchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectSlug: string
  onConfirm: (assigneeLabels: string[]) => void
  disabled?: boolean
}

const columnHelper = createColumnHelper<ProjectParticipant>()

export const TaskParticipantSearchModal = ({
  open,
  onOpenChange,
  projectSlug,
  onConfirm,
  disabled = false,
}: TaskParticipantSearchModalProps) => {
  const titleId = useId()
  const affiliationSelectId = useId()
  const nameInputId = useId()

  const [draftAffiliation, setDraftAffiliation] = useState(AFFILIATION_ALL)
  const [draftName, setDraftName] = useState("")
  const [appliedAffiliation, setAppliedAffiliation] = useState("")
  const [appliedName, setAppliedName] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listParams = useMemo(
    () => ({ affiliation: appliedAffiliation, name: appliedName }),
    [appliedAffiliation, appliedName],
  )

  const { data, isLoading, isError, error, refetch } = useProjectParticipantsQuery(
    projectSlug,
    listParams,
    { enabled: open && projectSlug.length > 0 },
  )

  const participants = data ?? EMPTY_PARTICIPANTS

  useEffect(() => {
    if (!open) return
    setDraftAffiliation(AFFILIATION_ALL)
    setDraftName("")
    setAppliedAffiliation("")
    setAppliedName("")
    setRowSelection({})
  }, [open])

  /** 검색(적용 파라미터) 변경 시에만 선택 초기화 — `data` 참조는 매 요청마다 바뀔 수 있음 */
  useEffect(() => {
    setRowSelection({})
  }, [appliedAffiliation, appliedName])

  const affiliationSelectItems = useMemo(() => {
    const entries: [string, ReactNode][] = [
      [AFFILIATION_ALL, "전체"],
      ...PROJECT_PARTICIPANT_AFFILIATION_OPTIONS.map((a) => [a, a] as [string, ReactNode]),
    ]
    return Object.fromEntries(entries) as Record<string, ReactNode>
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (!el) return
              el.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="전체 선택"
            disabled={disabled || participants.length === 0}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect() || disabled}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`${row.original.name} 선택`}
          />
        ),
      }),
      columnHelper.accessor("affiliation", { header: "소속" }),
      columnHelper.accessor("name", { header: "이름" }),
      columnHelper.accessor("jobTitle", { header: "직무" }),
    ],
    [participants.length, disabled],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack useReactTable
  const table = useReactTable({
    data: participants,
    columns,
    state: { rowSelection },
    enableRowSelection: !disabled,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const selectedCount = table.getSelectedRowModel().rows.length

  const handleSearchClick = () => {
    const aff = draftAffiliation === AFFILIATION_ALL ? "" : draftAffiliation.trim()
    setAppliedAffiliation(aff)
    setAppliedName(draftName.trim())
  }

  const handleConfirm = () => {
    const labels = table
      .getSelectedRowModel()
      .rows.map((r) => participantToAssigneeLabel(r.original))
    onConfirm(labels)
    setRowSelection({})
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setRowSelection({})
    }
    onOpenChange(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn("modal", styles.participantSearchModal)}
          aria-labelledby={titleId}
          aria-describedby={undefined}
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <h3 className={headingVariants({ variant: "modal" })} id={titleId}>
                참여인원 검색
              </h3>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className={modalCloseIconClassName}
                aria-label="닫기"
                disabled={disabled}
              >
                ×
              </Button>
            </Dialog.Close>
          </div>
          <AppModalBody className={styles.body}>
            <div className={styles.filterRow}>
              <div className={cn(styles.filterField, styles.affiliationField)}>
                <label className={filterLabelClass} htmlFor={affiliationSelectId}>
                  소속
                </label>
                <Select
                  value={draftAffiliation}
                  items={affiliationSelectItems}
                  disabled={disabled}
                  onValueChange={(v) => setDraftAffiliation(v ?? AFFILIATION_ALL)}
                >
                  <SelectTrigger
                    id={affiliationSelectId}
                    className={cn(styles.filterSelectTrigger, styles.filterControl)}
                    aria-label="소속 필터"
                  >
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value={AFFILIATION_ALL}>전체</SelectItem>
                    {PROJECT_PARTICIPANT_AFFILIATION_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={cn(styles.filterField, styles.nameField)}>
                <label className={filterLabelClass} htmlFor={nameInputId}>
                  이름
                </label>
                <Input
                  id={nameInputId}
                  className={cn(styles.filterControl, appModalStyles.singleLineField)}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  disabled={disabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearchClick()
                    }
                  }}
                />
              </div>
              <div className={styles.searchButtonWrap}>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="fixedMd"
                  disabled={disabled}
                  onClick={handleSearchClick}
                >
                  검색
                </Button>
              </div>
            </div>

            <div className={styles.tableSection}>
              {isError ? (
                <div className={styles.errorText} role="alert">
                  <span>{error?.message ?? "참여 인원을 불러오지 못했습니다."}</span>{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="ml-2 h-auto p-0 align-baseline"
                    onClick={() => void refetch()}
                  >
                    다시 시도
                  </Button>
                </div>
              ) : null}
              {isLoading ? (
                <p className={styles.loadingText}>불러오는 중…</p>
              ) : (
                <div className={styles.tableScroll}>
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className={styles.tableHeaderRow}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className={header.column.id === "select" ? styles.checkboxCell : undefined}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={columns.length} className={styles.emptyCell}>
                            검색 결과가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() ? "selected" : undefined}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className={
                                  cell.column.id === "select" ? styles.checkboxCell : undefined
                                }
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <AppModalActions className={styles.actionsCentered}>
              <Dialog.Close asChild>
                <ModalSecondaryButton actionSize="fixedMd" type="button" disabled={disabled}>
                  취소
                </ModalSecondaryButton>
              </Dialog.Close>
              <ModalPrimaryButton
                type="button"
                actionSize="fixedMd"
                disabled={disabled || selectedCount === 0}
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
