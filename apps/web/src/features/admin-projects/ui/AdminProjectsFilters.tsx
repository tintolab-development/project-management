import { type FormEvent, useId, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/shared/ui/button"
import { FilterDateField, FilterFieldShell } from "@/shared/ui/filter-field"
import { FilterSelectField } from "@/shared/ui/filter-field/FilterSelectField"
import { filterFieldLabelDomId } from "@/shared/ui/filter-field/filterFieldLabelDomId"
import { cn } from "@/lib/utils"

import {
  adminProjectStatusSchema,
  adminProjectTypeSchema,
} from "../model/adminProject"
import {
  ADMIN_PROJECT_STATUS_LABEL,
  ADMIN_PROJECT_TYPE_LABEL,
} from "../lib/adminProjectLabels"
import {
  mergeAdminProjectsFiltersIntoParams,
  parseAdminProjectsListFilters,
  type AdminProjectsListFilters,
} from "../lib/adminProjectsListParams"

import styles from "./AdminProjectsFilters.module.css"

const TYPE_VALUES = adminProjectTypeSchema.options
const STATUS_VALUES = adminProjectStatusSchema.options

const TYPE_OPTIONS = [
  { value: "", label: "유형 전체" },
  ...TYPE_VALUES.map((value) => ({
    value,
    label: ADMIN_PROJECT_TYPE_LABEL[value],
  })),
]

const STATUS_OPTIONS = [
  { value: "", label: "상태 전체" },
  ...STATUS_VALUES.map((value) => ({
    value,
    label: ADMIN_PROJECT_STATUS_LABEL[value],
  })),
]

export const AdminProjectsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const applied = parseAdminProjectsListFilters(searchParams)
  const [draft, setDraft] = useState<AdminProjectsListFilters>(() => ({
    ...applied,
  }))

  const qId = useId()
  const typeId = useId()
  const statusId = useId()
  const fromId = useId()
  const toId = useId()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = mergeAdminProjectsFiltersIntoParams(searchParams, draft)
    setSearchParams(next, { replace: true })
  }

  return (
    <form
      className={styles.form}
      aria-label="프로젝트 검색 및 필터"
      onSubmit={handleSubmit}
    >
      <div className={styles.grid}>
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
            placeholder="이름·설명·참가자"
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            aria-labelledby={filterFieldLabelDomId(qId)}
            autoComplete="off"
          />
        </FilterFieldShell>

        <FilterSelectField
          label="유형"
          placeholder="유형 전체"
          controlId={typeId}
          value={draft.type}
          onValueChange={(type) => setDraft((d) => ({ ...d, type }))}
          options={TYPE_OPTIONS}
          className={styles.categoryField}
          showAllOption={false}
        />

        <FilterSelectField
          label="상태"
          placeholder="상태 전체"
          controlId={statusId}
          value={draft.status}
          onValueChange={(status) => setDraft((d) => ({ ...d, status }))}
          options={STATUS_OPTIONS}
          className={styles.categoryField}
          showAllOption={false}
        />

        <FilterDateField
          label="기간 시작"
          placeholder="시작일 선택"
          controlId={fromId}
          value={draft.from}
          onValueChange={(from) => setDraft((d) => ({ ...d, from }))}
          fullWidth
        />

        <FilterDateField
          label="기간 종료"
          placeholder="종료일 선택"
          controlId={toId}
          value={draft.to}
          onValueChange={(to) => setDraft((d) => ({ ...d, to }))}
          fullWidth
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
