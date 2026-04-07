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
  /** 진행현황(프로그레스 바) 래퍼 최대 너비(기본 max-w-full로 열 너비에 맞춤) */
  barMaxWidthClassName?: string
}

const defaultLabels: Required<DomainProgressTableLabels> = {
  domain: "도메인",
  progress: "진행",
  bar: "진행현황",
  completion: "완료율",
}

export function DomainProgressTable({
  rows,
  className,
  emptyMessage = "등록된 도메인이 없습니다.",
  labels,
  barMaxWidthClassName = "max-w-full",
}: DomainProgressTableProps) {
  const L = { ...defaultLabels, ...labels }

  return (
    <Table className={cn("table-fixed", className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[30%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.domain}
            </Text>
          </TableHead>
          <TableHead className="w-[17%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.progress}
            </Text>
          </TableHead>
          <TableHead className="w-[35%] px-3 py-2.5 text-center align-middle font-normal">
            <Text as="span" variant="dashboardTableHead">
              {L.bar}
            </Text>
          </TableHead>
          <TableHead className="w-[18%] px-3 py-2.5 text-center align-middle font-normal">
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
                <TableCell className="px-3 text-center align-middle">
                  <Text as="span" variant="dashboardTableCell">
                    {row.label}
                  </Text>
                </TableCell>
                <TableCell className="px-3 text-center align-middle">
                  <Text as="span" variant="dashboardTableNumeric">
                    {row.completed} / {row.total}
                  </Text>
                </TableCell>
                <TableCell className="px-3 text-center align-middle">
                  <div
                    className={cn("mx-auto w-full min-w-0", barMaxWidthClassName)}
                    title={`${percent}%`}
                  >
                    <Progress value={percent} aria-label={`${row.label} 진행률 ${percent}%`} />
                  </div>
                </TableCell>
                <TableCell className="px-3 text-center align-middle">
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
