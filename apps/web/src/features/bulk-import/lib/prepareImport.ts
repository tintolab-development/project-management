import {
  DOMAIN_VALUE_ALIASES,
  FIXED_IMPORT_ORDER,
  TYPE_VALUE_ALIASES,
} from "@/shared/constants/aliases"
import { TYPE_LABELS } from "@/shared/constants/labels"
import type { Item } from "@/entities/item/model/types"
import { PRIORITY_VALUES } from "@/entities/item/model/types"
import { findDomainByAny } from "@/entities/domain/lib/findDomain"
import type { Domain } from "@/entities/domain/model/types"
import { normalizeDateInput } from "@/shared/lib/dates"
import { fromAlias, resolveHeaderKey } from "@/shared/lib/fromAlias"
import { normalizeKey, normalizeTextValue } from "@/shared/lib/text"
import { normalizeStatusValue } from "@/shared/lib/status"
import { guessDelimiter, parseDelimited } from "@/shared/lib/csv"

const mapRowByHeader = (headerRow: string[], row: string[]) => {
  const mapped: Record<string, string> = {}
  headerRow.forEach((headerCell, idx) => {
    const key = resolveHeaderKey(headerCell)
    if (key && !(key in mapped)) {
      mapped[key] = row[idx] ?? ""
    }
  })
  return mapped
}

const mapRowByFixedOrder = (row: string[]) => {
  const mapped: Record<string, string> = {}
  FIXED_IMPORT_ORDER.forEach((key, idx) => {
    mapped[key] = row[idx] ?? ""
  })
  return mapped
}

const hasHeaderRow = (firstRow: string[]) =>
  firstRow.some((cell) => !!resolveHeaderKey(cell))

const getImportDomainPreviewLabel = (
  domainValue: string,
  domains: Domain[],
) => {
  const existing = findDomainByAny(domainValue, domains)
  if (existing) return existing.name

  const aliasId = fromAlias(domainValue, DOMAIN_VALUE_ALIASES, "")
  if (aliasId) {
    const found = domains.find((d) => d.id === aliasId)
    return found?.name || aliasId
  }

  return normalizeTextValue(domainValue) || domains[0]?.name || "-"
}

export type ImportRowResult = {
  rowNo: number
  action: "create" | "update" | "skip" | "error"
  message: string
  title: string
  code: string
  itemData?: {
    code: string
    type: string
    domain: string
    title: string
    description: string
    priority: string
    status: string
    owner: string
    dueDate: string
    clientResponse: string
    finalConfirmedValue: string
    isLocked: boolean
  }
  existingId?: string
}

const normalizeImportRecord = (raw: Record<string, string>, rowNo: number) => {
  const type = fromAlias(raw.type, TYPE_VALUE_ALIASES, "information_request")
  const domain = normalizeTextValue(raw.domain)
  const title = String(raw.title ?? "").trim()
  const description = String(raw.description ?? "").trim()
  const priorityRaw = String(raw.priority ?? "").trim().toUpperCase()
  const priority = (PRIORITY_VALUES as readonly string[]).includes(priorityRaw)
    ? priorityRaw
    : "P1"
  const status = normalizeStatusValue(raw.status)
  const owner = String(raw.owner ?? "").trim()
  const dueDate = normalizeDateInput(raw.dueDate)
  const clientResponse = String(raw.clientResponse ?? "").trim()
  const finalConfirmedValue = String(raw.finalConfirmedValue ?? "").trim()
  const code = String(raw.code ?? "").trim().toUpperCase()

  if (!title) {
    return {
      valid: false as const,
      rowNo,
      message: "제목(title)이 비어 있습니다.",
    }
  }

  return {
    valid: true as const,
    rowNo,
    itemData: {
      code,
      type,
      domain,
      title,
      description,
      priority,
      status,
      owner,
      dueDate,
      clientResponse,
      finalConfirmedValue,
      isLocked: status === "확정",
    },
  }
}

export type PrepareImportResult = {
  results: ImportRowResult[]
  actionableCount: number
  createCount: number
  updateCount: number
  skipCount: number
  errorCount: number
  errorMessage: string
}

export const prepareImport = (text: string, items: Item[]): PrepareImportResult => {
  const delimiter = guessDelimiter(text)
  const rows = parseDelimited(text, delimiter)

  const getItemByCode = (code: string) => {
    const key = normalizeKey(code)
    return items.find(
      (item) =>
        normalizeKey(item.code) === key || normalizeKey(item.id) === key,
    )
  }

  if (!rows.length) {
    return {
      results: [],
      actionableCount: 0,
      createCount: 0,
      updateCount: 0,
      skipCount: 0,
      errorCount: 1,
      errorMessage: "읽을 수 있는 행이 없습니다.",
    }
  }

  const headerDetected = hasHeaderRow(rows[0])
  const dataRows = headerDetected ? rows.slice(1) : rows
  const results: ImportRowResult[] = []
  const batchCodes = new Set<string>()

  dataRows.forEach((row, index) => {
    const rowNo = headerDetected ? index + 2 : index + 1
    const raw = headerDetected ? mapRowByHeader(rows[0], row) : mapRowByFixedOrder(row)
    const normalized = normalizeImportRecord(raw, rowNo)

    if (!normalized.valid) {
      results.push({
        rowNo,
        action: "error",
        message: normalized.message,
        title: "",
        code: String(raw.code ?? "").trim(),
      })
      return
    }

    const data = normalized.itemData
    const codeKey = normalizeKey(data.code)

    if (codeKey) {
      if (batchCodes.has(codeKey)) {
        results.push({
          rowNo,
          action: "error",
          message: "같은 code가 같은 업로드 안에 중복되었습니다.",
          title: data.title,
          code: data.code,
          itemData: data,
        })
        return
      }
      batchCodes.add(codeKey)
    }

    const existing = data.code ? getItemByCode(data.code) : undefined

    if (existing && (existing.status === "확정" || existing.isLocked)) {
      results.push({
        rowNo,
        action: "skip",
        message: "확정된 항목이어서 건너뜁니다.",
        title: data.title,
        code: data.code,
        itemData: data,
        existingId: existing.id,
      })
      return
    }

    results.push({
      rowNo,
      action: existing ? "update" : "create",
      message: existing ? "기존 code 일치 → 업데이트" : "신규 생성",
      title: data.title,
      code: data.code,
      itemData: data,
      existingId: existing?.id,
    })
  })

  const actionableCount = results.filter(
    (row) => row.action === "create" || row.action === "update",
  ).length
  const createCount = results.filter((row) => row.action === "create").length
  const updateCount = results.filter((row) => row.action === "update").length
  const skipCount = results.filter((row) => row.action === "skip").length
  const errorCount = results.filter((row) => row.action === "error").length

  return {
    results,
    actionableCount,
    createCount,
    updateCount,
    skipCount,
    errorCount,
    errorMessage: "",
  }
}

export const getImportDomainPreviewLabelExport = (
  domainValue: string,
  domains: Domain[],
) => getImportDomainPreviewLabel(domainValue, domains)

export const typeLabelsForImport = TYPE_LABELS
