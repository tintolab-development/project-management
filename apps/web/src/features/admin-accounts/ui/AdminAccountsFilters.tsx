import { type FormEvent, useId, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/shared/ui/button"
import { FilterFieldShell } from "@/shared/ui/filter-field"
import { FilterSelectField } from "@/shared/ui/filter-field/FilterSelectField"
import { filterFieldLabelDomId } from "@/shared/ui/filter-field/filterFieldLabelDomId"

import {
  mergeAdminAccountsFiltersIntoParams,
  parseAdminAccountsListState,
  type AdminAccountsListFilters,
} from "../lib/adminAccountsListParams"

import styles from "./AdminAccountsFilters.module.css"

type ProjectOption = { value: string; label: string }

type Props = {
  projectOptions: ProjectOption[]
}

export const AdminAccountsFilters = ({ projectOptions }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const applied = parseAdminAccountsListState(searchParams)
  const [draft, setDraft] = useState<AdminAccountsListFilters>(() => ({
    q: applied.q,
    project: applied.project,
    limit: applied.limit,
  }))

  const qId = useId()
  const projectId = useId()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const merged = mergeAdminAccountsFiltersIntoParams(searchParams, draft)
    for (const key of [...merged.keys()]) {
      if (key.startsWith("p_")) merged.delete(key)
    }
    setSearchParams(merged, { replace: true })
  }

  return (
    <form
      className={styles.form}
      aria-label="계정 검색 및 필터"
      onSubmit={handleSubmit}
    >
      <div className={styles.grid}>
        <FilterFieldShell
          label="이름"
          controlId={qId}
          className={styles.searchField}
          fullWidth
          bodyClassName={styles.inputShellBody}
        >
          <Input
            id={qId}
            type="search"
            name="q"
            className={styles.searchInput}
            placeholder="이름으로 검색"
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            aria-labelledby={filterFieldLabelDomId(qId)}
            autoComplete="off"
          />
        </FilterFieldShell>

        <FilterSelectField
          label="소속"
          placeholder="전체"
          controlId={projectId}
          value={draft.project}
          onValueChange={(project) =>
            setDraft((d) => ({ ...d, project }))
          }
          options={projectOptions}
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
