import type { FormEventHandler } from "react"
import { useState } from "react"
import {
  useForm,
  type UseFormRegister,
  type UseFormRegisterReturn,
} from "react-hook-form"
import clsx from "clsx"

import type { Item } from "@/entities/item/model/types"
import type { Domain } from "@/entities/domain/model/types"
import type { Comment } from "@/entities/comment/model/types"
import type { HistoryEntry } from "@/entities/history/model/types"
import type { ItemStatus } from "@/shared/constants/labels"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelectOrCurrent,
} from "@/entities/domain/lib/domainTree"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Input, inputControlClassName } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pill, pillToneFromLegacyClass } from "@/shared/ui/pill"
import { formStackStyles } from "@/shared/ui/form-stack"
import { FormLabel, Text } from "@/shared/ui/typography"

import pageStyles from "./ItemsPage.module.css"

export type DetailForm = {
  title: string
  domain: string
  priority: Item["priority"]
  status: string
  owner: string
  dueDate: string
  description: string
  clientResponse: string
  finalConfirmedValue: string
}

export type ItemDetailFormProps = {
  selected: Item
  locked: boolean
  domains: Domain[]
  getDomainLabel: (id: string) => string
  statusOptions: ItemStatus[]
  titleField: UseFormRegisterReturn<"title">
  handleDetailTitleRef: (el: HTMLTextAreaElement | null) => void
  handleDetailTitleInput: () => void
  register: UseFormRegister<DetailForm>
  onSubmit: FormEventHandler<HTMLFormElement>
  itemComments: Comment[]
  itemHistory: HistoryEntry[]
  commentAuthor: string
  addComment: (author: string, body: string) => boolean | Promise<boolean>
  toggleLockSelectedItem: () => void
}

export const ItemDetailForm = ({
  selected,
  locked,
  domains,
  getDomainLabel,
  statusOptions,
  titleField,
  handleDetailTitleRef,
  handleDetailTitleInput,
  register,
  onSubmit,
  itemComments,
  itemHistory,
  commentAuthor,
  addComment,
  toggleLockSelectedItem,
}: ItemDetailFormProps) => {
  const { ref: rhfTitleRef, ...titleRest } = titleField

  return (
    <form className={pageStyles.detailWrap} onSubmit={onSubmit}>
      <div className={pageStyles.detailHeader}>
        <div>
          <Text as="div" variant="detailCode">
            {selected.code}
          </Text>
          <Textarea
            className="min-h-0 resize-none border-0 bg-transparent p-0 text-app-lg font-bold text-foreground shadow-none focus-visible:ring-0 aria-invalid:ring-0"
            rows={2}
            disabled={locked}
            aria-label="제목"
            {...titleRest}
            ref={(el) => {
              rhfTitleRef(el)
              handleDetailTitleRef(el)
            }}
            onInput={handleDetailTitleInput}
          />
        </div>
        <div className={pageStyles.detailPills}>
          <Pill
            tone={
              selected.priority === "P0"
                ? "danger"
                : selected.priority === "P1"
                  ? "warn"
                  : "dark"
            }
          >
            {selected.priority}
          </Pill>
          <Pill tone="primary">{getDomainLabel(selected.domain)}</Pill>
          <Pill
            tone={pillToneFromLegacyClass(
              STATUS_STYLE[selected.status] || "dark",
            )}
          >
            {STATUS_LABELS[selected.status]}
          </Pill>
        </div>
      </div>

      <div className={formStackStyles.formGrid}>
        <div>
          <FormLabel htmlFor="detail-type">유형</FormLabel>
          <Input
            id="detail-type"
            disabled
            value={TYPE_LABELS[selected.type]}
            readOnly
          />
        </div>
        <div>
          <FormLabel htmlFor="detail-domain">도메인</FormLabel>
          <select
            id="detail-domain"
            className={clsx(inputControlClassName)}
            disabled={locked}
            {...register("domain")}
          >
            {walkDomainsFlatForClassificationSelectOrCurrent(
              domains,
              selected.domain,
            ).map((d) => (
              <option key={d.id} value={d.id}>
                {getDomainOptionLabel(domains, d.id)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormLabel htmlFor="detail-priority">우선순위</FormLabel>
          <select
            id="detail-priority"
            className={clsx(inputControlClassName)}
            disabled={locked}
            {...register("priority")}
          >
            {(["P0", "P1", "P2"] as const).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormLabel htmlFor="detail-status">상태</FormLabel>
          <select
            id="detail-status"
            className={clsx(inputControlClassName)}
            disabled={locked}
            {...register("status")}
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormLabel htmlFor="detail-owner">담당자</FormLabel>
          <Input id="detail-owner" disabled={locked} {...register("owner")} />
        </div>
        <div>
          <FormLabel htmlFor="detail-due">마감일</FormLabel>
          <Input
            id="detail-due"
            type="date"
            disabled={locked}
            {...register("dueDate")}
          />
        </div>
      </div>

      <div className={formStackStyles.formSection}>
        <FormLabel htmlFor="detail-desc">설명</FormLabel>
        <Textarea
          id="detail-desc"
          rows={3}
          disabled={locked}
          {...register("description")}
        />
      </div>

      <div className={pageStyles.detailSplit}>
        <div className={formStackStyles.formSection}>
          <FormLabel htmlFor="detail-client">고객 회신값</FormLabel>
          <Textarea
            id="detail-client"
            rows={6}
            disabled={locked}
            {...register("clientResponse")}
          />
        </div>
        <div className={formStackStyles.formSection}>
          <FormLabel htmlFor="detail-final">최종 확인값</FormLabel>
          <Textarea
            id="detail-final"
            rows={6}
            disabled={locked}
            {...register("finalConfirmedValue")}
          />
        </div>
      </div>

      <div className={pageStyles.detailActions}>
        <Button
          type="submit"
          appearance="fill"
          dimension="hug"
          disabled={locked}
        >
          저장
        </Button>
        <Button
          type="button"
          appearance="outline"
          dimension="hug"
          onClick={() => toggleLockSelectedItem()}
        >
          {locked ? "확정 해제" : "확정 처리"}
        </Button>
      </div>

      <div className={pageStyles.detailSplit}>
        <Card variant="subpanel">
          <Text as="div" variant="subpanelHead">
            코멘트
          </Text>
          <CommentSection
            key={selected.id}
            defaultAuthor={commentAuthor}
            addComment={addComment}
          />
          <hr className={pageStyles.commentsDivider} aria-hidden="true" />
          <div className={pageStyles.commentsList}>
            {itemComments.map((comment) => (
              <div key={comment.id} className={pageStyles.commentRow}>
                <Text as="div" variant="commentAuthor">
                  {comment.author}
                </Text>
                <Text as="div" variant="commentMeta">
                  {formatDateTime(comment.createdAt)}
                </Text>
                <Text as="div" variant="body">
                  {comment.body}
                </Text>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="subpanel">
          <Text as="div" variant="subpanelHead">
            변경 이력
          </Text>
          <div className={pageStyles.historyList}>
            {itemHistory.map((h) => (
              <Card key={h.id} variant="history">
                <div>
                  <Text as="div" variant="emphasis">
                    {h.summary}
                  </Text>
                </div>
                <Text as="div" variant="small">
                  {h.actor}
                </Text>
                <Text as="div" variant="caption" className="mt-1">
                  {formatDateTime(h.createdAt)}
                </Text>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </form>
  )
}

const CommentSection = ({
  defaultAuthor,
  addComment,
}: {
  defaultAuthor: string
  addComment: (author: string, body: string) => boolean | Promise<boolean>
}) => {
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { author: defaultAuthor || "틴토랩 PM", body: "" },
  })

  const onAdd = handleSubmit(async (data) => {
    setCommentSubmitting(true)
    try {
      const result = addComment(data.author, data.body)
      const ok = await Promise.resolve(result)
      if (ok) {
        reset({ author: data.author, body: "" })
      }
    } finally {
      setCommentSubmitting(false)
    }
  })

  return (
    <div className={pageStyles.commentCompose}>
      <div className={pageStyles.commentAssigneeZone} role="group" aria-label="담당자">
        <div className={pageStyles.commentAssigneeRow}>
          <span className={pageStyles.commentAssigneeKey}>담당자</span>
          <span className={pageStyles.commentAssigneeSep} aria-hidden="true">
            :
          </span>
          <div className={pageStyles.commentAssigneeInputWrap}>
            <Input
              placeholder="이름 | 소속 또는 권한"
              aria-label="담당자 이름, 소속 또는 권한"
              className="shadow-none"
              {...register("author")}
            />
          </div>
        </div>
      </div>
      <div className={pageStyles.commentTextZone}>
        <Textarea
          rows={3}
          placeholder="질문, 보완 요청, 회의 메모를 입력하세요."
          aria-label="코멘트 내용"
          className={pageStyles.commentTextareaInZone}
          disabled={commentSubmitting}
          {...register("body")}
        />
      </div>
      <Button
        type="button"
        appearance="outline"
        dimension="hug"
        disabled={commentSubmitting}
        onClick={onAdd}
      >
        코멘트 추가
      </Button>
    </div>
  )
}
