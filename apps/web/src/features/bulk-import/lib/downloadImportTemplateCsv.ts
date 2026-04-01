const CSV_BOM = "\uFEFF"

const csvEscape = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** 한글 헤더 — `resolveHeaderKey` / HEADER_ALIASES와 호환 */
const IMPORT_TEMPLATE_HEADER_KO = [
  "유형",
  "도메인",
  "제목",
  "설명",
  "우선순위",
  "상태",
  "담당자",
  "마감일",
  "고객회신값",
  "최종확인값",
  "코드",
] as const

const IMPORT_TEMPLATE_SAMPLE_ROWS: string[][] = [
  [
    "정보요청",
    "공통",
    "샘플 항목 (신규 예시)",
    "설명을 입력합니다.",
    "P1",
    "논의",
    "홍길동",
    "2026-04-15",
    "",
    "",
    "",
  ],
  [
    "검토요청",
    "예약",
    "샘플 항목 (코드가 있으면 업데이트)",
    "",
    "P2",
    "방향합의",
    "",
    "",
    "고객 회신 예시",
    "",
    "DEMO-CODE-01",
  ],
]

const buildImportTemplateCsvText = () => {
  const lines = [
    IMPORT_TEMPLATE_HEADER_KO.map((cell) => csvEscape(cell)).join(","),
    ...IMPORT_TEMPLATE_SAMPLE_ROWS.map((row) =>
      row.map((cell) => csvEscape(cell)).join(","),
    ),
  ]
  return `${CSV_BOM}${lines.join("\r\n")}\r\n`
}

export const getImportTemplateCsvBlob = () =>
  new Blob([buildImportTemplateCsvText()], { type: "text/csv;charset=utf-8" })

export const triggerDownloadImportTemplateCsv = () => {
  const blob = getImportTemplateCsvBlob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "tdw-import-template.csv"
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
