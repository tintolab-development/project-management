import { useMemo, useState } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table"

import { Button } from "@/shared/ui/button"
import { TaskParticipantSearchModal } from "@/pages/items/ui/TaskParticipantSearchModal"
import { type ProjectParticipant } from "@/shared/api/projectParticipants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ADMIN_PARTICIPANT_SEARCH_PROJECT_SLUG } from "../lib/adminParticipantSearchProjectSlug"

import styles from "./AdminParticipantSearchInline.module.css"

type Props = {
  projectSlug?: string
  selectedNames: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
}

const columnHelper = createColumnHelper<ProjectParticipant>()

const parseParticipantLabel = (label: string) => {
  const [name = "", affiliation = ""] = label.split("|").map((s) => s.trim())
  return { name, affiliation }
}

export const AdminParticipantSearchInline = ({
  projectSlug = ADMIN_PARTICIPANT_SEARCH_PROJECT_SLUG,
  selectedNames,
  onAdd,
  onRemove,
}: Props) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedParticipants, setSelectedParticipants] = useState<
    ProjectParticipant[]
  >([])

  const participantRows = useMemo(
    () => selectedParticipants.filter((p) => selectedNames.includes(p.name)),
    [selectedParticipants, selectedNames],
  )

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
            disabled={participantRows.length === 0}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`${row.original.name} 선택`}
          />
        ),
      }),
      columnHelper.accessor("affiliation", {
        header: "소속",
      }),
      columnHelper.accessor("name", {
        header: "이름",
      }),
      columnHelper.accessor("jobTitle", {
        header: "직무",
      }),
    ],
    [participantRows.length],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack useReactTable
  const table = useReactTable({
    data: participantRows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })
  const selectedCount = table.getSelectedRowModel().rows.length

  const handleDeleteSelected = () => {
    const selectedNamesInTable = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.name)
    if (selectedNamesInTable.length === 0) return
    selectedNamesInTable.forEach((name) => onRemove(name))
    setSelectedParticipants((prev) =>
      prev.filter((participant) => !selectedNamesInTable.includes(participant.name)),
    )
    setRowSelection({})
  }

  const handleConfirmLabels = (labels: string[]) => {
    labels.forEach((label) => {
      const { name } = parseParticipantLabel(label)
      if (!name || selectedNames.includes(name)) return
      onAdd(name)
    })
  }

  const handleConfirmParticipants = (participants: ProjectParticipant[]) => {
    setSelectedParticipants((prev) => {
      const nextMap = new Map(prev.map((participant) => [participant.name, participant]))
      participants.forEach((participant) => {
        nextMap.set(participant.name, participant)
        if (!selectedNames.includes(participant.name)) {
          onAdd(participant.name)
        }
      })
      return Array.from(nextMap.values())
    })
  }

  return (
    <section className={styles.root} aria-label="참여인원">
      <div className={styles.headerRow}>
        <p className={styles.heading}>
          참여인원
          <span className={styles.required}>*</span>
        </p>
        <div className={styles.actions}>
          <Button
            type="button"
            appearance="outline"
            dimension="hug"
            className={styles.actionButton}
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0}
          >
            삭제
          </Button>
          <Button
            type="button"
            appearance="fill"
            dimension="hug"
            className={styles.actionButton}
            onClick={() => setIsSearchModalOpen(true)}
          >
            참여인원 검색
          </Button>
        </div>
      </div>

      <div className={styles.table}>
        {participantRows.length === 0 ? (
          <p className={styles.emptyMessage}>[참여인원 검색]을 통해 등록해주세요</p>
        ) : (
          <div className={styles.tableScroll}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className={styles.tableHeaderRow}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={header.column.id === "select" ? styles.checkboxCell : styles.alignCenter}
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.id === "select" ? styles.checkboxCell : styles.alignCenter}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <TaskParticipantSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        projectSlug={projectSlug}
        onConfirm={handleConfirmLabels}
        onConfirmParticipants={handleConfirmParticipants}
      />
    </section>
  )
}
