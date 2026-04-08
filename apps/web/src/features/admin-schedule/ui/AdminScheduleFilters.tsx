import { type FormEvent, useId, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/shared/ui/button"
import { FilterFieldShell } from "@/shared/ui/filter-field"
import { FilterSelectField } from "@/shared/ui/filter-field/FilterSelectField"
import { filterFieldLabelDomId } from "@/shared/ui/filter-field/filterFieldLabelDomId"
import { cn } from "@/lib/utils"

import {
  mergeAdminScheduleFiltersIntoParams,
  parseAdminScheduleListState,
} from "../lib/adminScheduleListParams"

import styles from "./AdminScheduleFilters.module.css"

type ProjectOption = { value: string; label: string }

type Draft = {
  project: string
  q: string
}

type Props = {
  projectOptions: ProjectOption[]
}

export const AdminScheduleFilters = ({ projectOptions }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const applied = useMemo(
    () => parseAdminScheduleListState(new URLSearchParams(queryString)),
    [queryString],
  )
  const [draft, setDraft] = useState<Draft>(() => ({
    project: applied.project,
    q: applied.q,
  }))

  const projectControlId = useId()
  const qId = useId()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSearchParams(
      mergeAdminScheduleFiltersIntoParams(searchParams, draft),
      { replace: true },
    )
  }

  return (
    <form
      className={styles.form}
      aria-label="일정 검색 및 필터"
      onSubmit={handleSubmit}
    >
      <div className={styles.grid}>
        <FilterSelectField
          label="프로젝트"
          placeholder="전체"
          controlId={projectControlId}
          value={draft.project}
          onValueChange={(project) =>
            setDraft((d) => ({ ...d, project }))
          }
          options={projectOptions}
          fullWidth
          showAllOption={false}
        />

        <FilterFieldShell
          label="검색"
          controlId={qId}
          className={styles.searchField}
          fullWidth
          bodyClassName={styles.inputShellBody}
        >
          <Input
            id={qId}
            type="search"
            name="q"
            className={cn(styles.searchInput, "focus-visible:ring-0")}
            placeholder="프로젝트·담당·소속"
            value={draft.q}
            onChange={(e) =>
              setDraft((d) => ({ ...d, q: e.target.value }))
            }
            aria-labelledby={filterFieldLabelDomId(qId)}
            autoComplete="off"
          />
        </FilterFieldShell>

        <div className={styles.searchActions}>
          <Button
            type="submit"
            appearance="outline"
            dimension="fixedLg"
            className={styles.searchButton}
          >
            조회
          </Button>
        </div>
      </div>
    </form>
  )
}
