import * as Dialog from "@radix-ui/react-dialog"

import { Button } from "@/shared/ui/button"
import { ModalSecondaryButton } from "@/shared/ui/modal-dialog-buttons"
import { Heading, modalCloseIconClassName } from "@/shared/ui/typography"

import { formatAdminLogEditedAt } from "../lib/formatAdminLogEditedAt"
import type { AdminLogRow } from "../model/adminLog"

import styles from "./AdminLogDetailModal.module.css"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AdminLogRow | null
}

export const AdminLogDetailModal = ({ open, onOpenChange, log }: Props) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal admin-log-detail-modal"
          aria-describedby="admin-log-detail-description"
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading as="h3" variant="modal">
                로그 상세
              </Heading>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className={modalCloseIconClassName}
                aria-label="닫기"
              >
                ×
              </Button>
            </Dialog.Close>
          </div>

          <Dialog.Description
            id="admin-log-detail-description"
            className="sr-only"
          >
            선택한 관리 로그의 수정 일시, 프로젝트, 변경 내용, 담당자 정보를 확인할 수 있습니다.
          </Dialog.Description>

          {log ? (
            <div className={styles.body} data-slot="app-modal-body">
              <section className={styles.summary} aria-label="요약">
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>수정일시</span>
                  <time
                    className={styles.summaryValue}
                    dateTime={log.editedAt}
                  >
                    {formatAdminLogEditedAt(log.editedAt)}
                  </time>
                </div>
                <div className={styles.summaryDivider} aria-hidden />
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>프로젝트</span>
                  <span className={styles.summaryValue}>{log.projectName}</span>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="log-change-heading">
                <h4 id="log-change-heading" className={styles.sectionTitle}>
                  변경 내용
                </h4>
                <div className={styles.inlineFields}>
                  <div className={styles.inlineField}>
                    <span className={styles.fieldLabel}>분류</span>
                    <span className={styles.fieldValue}>{log.category || "—"}</span>
                  </div>
                  <div className={styles.inlineField}>
                    <span className={styles.fieldLabel}>아이템</span>
                    <span className={styles.fieldValue}>{log.itemName || "—"}</span>
                  </div>
                </div>
                <div className={styles.contentShell}>
                  <span className={styles.contentLabel}>수정내용</span>
                  <div
                    className={styles.contentBox}
                    tabIndex={0}
                    role="region"
                    aria-label="수정내용 전문"
                  >
                    {log.editContent?.trim() ? log.editContent : "—"}
                  </div>
                </div>
              </section>

              <section
                className={styles.section}
                aria-labelledby="log-people-heading"
              >
                <h4 id="log-people-heading" className={styles.sectionTitle}>
                  담당 · 접속
                </h4>
                <ul className={styles.metaGrid}>
                  <li className={styles.metaItem}>
                    <span className={styles.metaLabel}>소속</span>
                    <span className={styles.metaValue}>{log.affiliation || "—"}</span>
                  </li>
                  <li className={styles.metaItem}>
                    <span className={styles.metaLabel}>수정자</span>
                    <span className={styles.metaValue}>{log.editor || "—"}</span>
                  </li>
                  <li className={styles.metaItem}>
                    <span className={styles.metaLabel}>IP</span>
                    <span className={`${styles.metaValue} ${styles.mono}`}>
                      {log.ip || "—"}
                    </span>
                  </li>
                </ul>
              </section>

              <section
                className={styles.idSection}
                aria-labelledby="log-ids-heading"
              >
                <h4 id="log-ids-heading" className={styles.idSectionTitle}>
                  식별자
                </h4>
                <dl className={styles.idList}>
                  <div className={styles.idRow}>
                    <dt>로그 ID</dt>
                    <dd className={styles.mono}>{log.id}</dd>
                  </div>
                  <div className={styles.idRow}>
                    <dt>프로젝트 ID</dt>
                    <dd className={styles.mono}>{log.projectId}</dd>
                  </div>
                </dl>
              </section>

              <div className={styles.actions}>
                <ModalSecondaryButton
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  닫기
                </ModalSecondaryButton>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
