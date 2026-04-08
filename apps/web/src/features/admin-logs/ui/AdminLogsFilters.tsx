import { type FormEvent, useId, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/shared/ui/button"
import { FilterFieldShell } from "@/shared/ui/filter-field"
import { FilterSelectField } from "@/shared/ui/filter-field/FilterSelectField"
import { filterFieldLabelDomId } from "@/shared/ui/filter-field/filterFieldLabelDomId"
import { cn } from "@/lib/utils"

import { ADMIN_LOG_AFFILIATION_FILTER_OPTIONS } from "../lib/adminLogAffiliationOptions"
import {
  mergeAdminLogsFiltersIntoParams,
  parseAdminLogsListState,
} from "../lib/adminLogsListParams"

import styles from "./AdminLogsFilters.module.css"

type ProjectOption = { value: string; label: string }

type Draft = {
  project: string
  q: string
  affiliation: string
}

type Props = {
  projectOptions: ProjectOption[]
}

export const AdminLogsFilters = ({ projectOptions }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const applied = useMemo(
    () => parseAdminLogsListState(new URLSearchParams(queryString)),
    [queryString],
  )
  const [draft, setDraft] = useState<Draft>(() => ({
    project: applied.project,
    q: applied.q,
    affiliation: applied.affiliation,
  }))

  const projectControlId = useId()
  const qId = useId()
  const affiliationId = useId()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSearchParams(
      mergeAdminLogsFiltersIntoParams(searchParams, draft),
      { replace: true },
    )
  }

  return (
    <form
      className={styles.form}
      aria-label="로그 검색 및 필터"
      onSubmit={handleSubmit}
    >
      <div className={styles.grid}>
        <FilterSelectField
          label="프로젝트"
          placeholder="프로젝트를 선택해 주세요"
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
          label="수정자/아이템"
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
            placeholder="수정자/아이템을 입력해 주세요"
            value={draft.q}
            onChange={(e) =>
              setDraft((d) => ({ ...d, q: e.target.value }))
            }
            aria-labelledby={filterFieldLabelDomId(qId)}
            autoComplete="off"
          />
        </FilterFieldShell>

        <FilterSelectField
          label="소속"
          placeholder="전체"
          controlId={affiliationId}
          value={draft.affiliation}
          onValueChange={(affiliation) =>
            setDraft((d) => ({ ...d, affiliation }))
          }
          options={ADMIN_LOG_AFFILIATION_FILTER_OPTIONS}
          fullWidth
          showAllOption={false}
        />

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
