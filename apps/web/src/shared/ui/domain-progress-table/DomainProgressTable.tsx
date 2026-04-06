import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Text } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

import { computeProgressPercent } from "./lib/computeProgressPercent"

export type DomainProgressRow = {
  id: string
  label: string
  completed: number
  total: number
}

export type DomainProgressTableLabels = {
  domain?: string
  progress?: string
  bar?: string
  completion?: string
}

export type DomainProgressTableProps = {
  rows: DomainProgressRow[]
  className?: string
  emptyMessage?: string
  labels?: DomainProgressTableLabels
  /** 진행 바 열 최대 너비(px 기준 tailwind max-w) */
  barMaxWidthClassName?: string
}

const defaultLabels: Required<DomainProgressTableLabels> = {
  domain: "도메인",
  progress: "진행",
  bar: "바",
  completion: "완료율",
}

export function DomainProgressTable({
  rows,
  className,
  emptyMessage = "등록된 도메인이 없습니다.",
  labels,
  barMaxWidthClassName = "max-w-[200px]",
}: DomainProgressTableProps) {
  const L = { ...defaultLabels, ...labels }

  return (
    <Table className={cn("table-fixed", className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[28%] px-3 py-2.5 align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.domain}
            </Text>
          </TableHead>
          <TableHead className="w-[18%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.progress}
            </Text>
          </TableHead>
          <TableHead className="w-[40%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.bar}
            </Text>
          </TableHead>
          <TableHead className="w-[14%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.completion}
            </Text>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={4} className="text-center">
              <Text as="span" variant="dashboardEmpty">
                {emptyMessage}
              </Text>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            const percent = computeProgressPercent(row.completed, row.total)
            return (
              <TableRow key={row.id}>
                <TableCell className="align-middle">
                  <Text as="span" variant="dashboardTableCell">
                    {row.label}
                  </Text>
                </TableCell>
                <TableCell className="text-center align-middle">
                  <Text as="span" variant="dashboardTableNumeric">
                    {row.completed} / {row.total}
                  </Text>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={cn("mx-auto w-full", barMaxWidthClassName)}
                    title={`${percent}%`}
                  >
                    <Progress value={percent} aria-label={`${row.label} 진행률 ${percent}%`} />
                  </div>
                </TableCell>
                <TableCell className="text-center align-middle">
                  <Text as="span" variant="dashboardTableNumeric">
                    {percent}%
                  </Text>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
