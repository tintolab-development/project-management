import * as Dialog from "@radix-ui/react-dialog"
import { useState } from "react"
import clsx from "clsx"
import { Button } from "@/shared/ui/button"
import { useAppStore } from "@/app/store/useAppStore"
import {
  prepareImport,
  type ImportRowResult,
  getImportDomainPreviewLabelExport,
  typeLabelsForImport,
} from "@/features/bulk-import/lib/prepareImport"
import { STATUS_LABELS } from "@/shared/constants/labels"
import { triggerDownloadImportTemplateCsv } from "@/features/bulk-import/lib/downloadImportTemplateCsv"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actionPillClass = (action: ImportRowResult["action"]) => {
  if (action === "create") return "pill success"
  if (action === "update") return "pill primary"
  if (action === "skip") return "pill warn"
  return "pill danger"
}

export const BulkImportModal = ({ open, onOpenChange }: Props) => {
  const items = useAppStore((s) => s.items)
  const domains = useAppStore((s) => s.domains)
  const executeBulkImport = useAppStore((s) => s.executeBulkImport)

  const [paste, setPaste] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileText, setFileText] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ReturnType<typeof prepareImport> | null>(
    null,
  )

  const resetUi = () => {
    setPaste("")
    setFileName("")
    setFileText(null)
    setParsed(null)
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) resetUi()
  }

  const handleFile = async (file: File | null) => {
    if (!file) {
      setFileName("")
      setFileText(null)
      return
    }
    setFileName(file.name)
    const text = await file.text()
    setFileText(text)
  }

  const handlePreview = () => {
    const source = fileText ?? paste.trim()
    if (!source) {
      window.alert("CSV 파일을 선택하거나 엑셀 데이터를 붙여넣어 주세요.")
      return
    }
    const result = prepareImport(source, items)
    setParsed(result)
  }

  const handleDownloadTemplateCsv = () => {
    triggerDownloadImportTemplateCsv()
  }

  const handleExecute = () => {
    if (!parsed?.results.length) return
    const actionable = parsed.results.filter(
      (row) => row.action === "create" || row.action === "update",
    )
    executeBulkImport(actionable)
    handleOpenChange(false)
  }

  const previewRows = parsed?.results.slice(0, 50) ?? []

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal import-modal" aria-describedby={undefined}>
          <div className="modal-head">
            <Dialog.Title asChild>
              <h3>엑셀 일괄등록</h3>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="border-none bg-transparent text-[28px] leading-none"
                aria-label="닫기"
              >
                ×
              </Button>
            </Dialog.Close>
          </div>

          <div className="import-help">
            <div className="import-help-title">사용 방법</div>
            <ul className="import-help-list">
              <li>
                <strong>방법 1</strong> : 엑셀에서 헤더 포함 행을 복사해서 오른쪽 칸에
                그대로 붙여넣기
              </li>
              <li>
                <strong>방법 2</strong> : 엑셀에서 <strong>CSV UTF-8</strong>로 저장 후
                업로드
              </li>
              <li>
                <strong>code</strong> 가 기존 항목과 같으면 <strong>업데이트</strong>,
                없으면 <strong>신규 생성</strong>
              </li>
              <li>
                <strong>확정</strong> 항목은 보호를 위해 일괄업데이트에서 자동 건너뜀
              </li>
            </ul>
            <div className="import-columns muted">
              헤더 예: type, domain, title, description, priority, status, owner,
              dueDate, clientResponse, finalConfirmedValue, code
            </div>
            <div className="import-template-action" style={{ marginTop: 10 }}>
              <Button
                type="button"
                appearance="outline"
                dimension="hug"
                onClick={handleDownloadTemplateCsv}
                aria-label="일괄등록용 템플릿 CSV 파일 다운로드"
              >
                템플릿 CSV 다운로드
              </Button>
            </div>
          </div>

          <div className="import-grid">
            <div>
              <label className="muted" htmlFor="import-file">
                CSV 파일
              </label>
              <input
                id="import-file"
                type="file"
                accept=".csv,.txt"
                className="input"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {fileName ? (
                <div className="muted" style={{ marginTop: 8 }}>
                  선택됨: {fileName}
                </div>
              ) : null}

              <div className="form-section" style={{ marginTop: 14 }}>
                <label htmlFor="import-paste">엑셀 붙여넣기</label>
                <textarea
                  id="import-paste"
                  className="textarea"
                  rows={12}
                  placeholder="엑셀에서 복사한 영역을 붙여넣으세요."
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                />
              </div>

              <div className="import-inline-actions">
                <Button
                  type="button"
                  appearance="outline"
                  dimension="hug"
                  onClick={handlePreview}
                >
                  미리보기
                </Button>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="hug"
                  disabled={!parsed || parsed.actionableCount === 0}
                  onClick={handleExecute}
                >
                  실행
                </Button>
              </div>
            </div>

            <div className="import-preview">
              {!parsed ? (
                <div className="muted">
                  미리보기를 실행하면 등록/업데이트/건너뜀 결과가 표시됩니다.
                </div>
              ) : parsed.errorMessage ? (
                <div className="muted">{parsed.errorMessage}</div>
              ) : (
                <>
                  <div className="import-summary">
                    <span className={clsx("pill", parsed.actionableCount ? "success" : "dark")}>
                      실행 가능 {parsed.actionableCount}
                    </span>
                    <span className={clsx("pill", parsed.createCount ? "success" : "dark")}>
                      신규 {parsed.createCount}
                    </span>
                    <span className={clsx("pill", parsed.updateCount ? "primary" : "dark")}>
                      업데이트 {parsed.updateCount}
                    </span>
                    <span className={clsx("pill", parsed.skipCount ? "warn" : "dark")}>
                      건너뜀 {parsed.skipCount}
                    </span>
                    <span className={clsx("pill", parsed.errorCount ? "danger" : "dark")}>
                      오류 {parsed.errorCount}
                    </span>
                  </div>
                  <table className="import-table">
                    <thead>
                      <tr>
                        <th>행</th>
                        <th>결과</th>
                        <th>code</th>
                        <th>유형</th>
                        <th>도메인</th>
                        <th>제목</th>
                        <th>상태</th>
                        <th>비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.length === 0 ? (
                        <tr>
                          <td colSpan={8}>표시할 데이터가 없습니다.</td>
                        </tr>
                      ) : (
                        previewRows.map((row) => (
                          <tr key={`${row.rowNo}-${row.code}`}>
                            <td>{row.rowNo}</td>
                            <td>
                              <span className={actionPillClass(row.action)}>
                                {row.action === "create"
                                  ? "신규"
                                  : row.action === "update"
                                    ? "업데이트"
                                    : row.action === "skip"
                                      ? "건너뜀"
                                      : "오류"}
                              </span>
                            </td>
                            <td>{row.code || "-"}</td>
                            <td>
                              {row.itemData?.type
                                ? typeLabelsForImport[row.itemData.type] ?? "-"
                                : "-"}
                            </td>
                            <td>
                              {row.itemData?.domain
                                ? getImportDomainPreviewLabelExport(
                                    row.itemData.domain,
                                    domains,
                                  )
                                : "-"}
                            </td>
                            <td>{row.itemData?.title || row.title || "-"}</td>
                            <td>
                              {row.itemData?.status
                                ? STATUS_LABELS[
                                    row.itemData.status as keyof typeof STATUS_LABELS
                                  ] ?? row.itemData.status
                                : "-"}
                            </td>
                            <td>{row.message || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {parsed.results.length > 50 ? (
                    <div className="muted" style={{ marginTop: 10 }}>
                      미리보기는 처음 50행까지만 표시했습니다.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
