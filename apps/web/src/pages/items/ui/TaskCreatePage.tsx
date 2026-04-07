import * as Dialog from "@radix-ui/react-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import { useAuthSessionStore } from "@/features/auth"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import { getNextItemCode } from "@/entities/item/lib/nextItemCode"
import type { ItemType } from "@/entities/item/model/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS, STATUS_VALUES, TYPE_LABELS } from "@/shared/constants/labels"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"
import { FilterDateField, filterFieldLabelStyles } from "@/shared/ui/filter-field"
import { AppModalActions, AppModalBody, AppModalField, appModalStyles } from "@/shared/ui/app-modal"
import { Card } from "@/shared/ui/card"
import { MarkdownTextEditor } from "@/shared/ui/markdown-text-editor"
import { postTaskDraftComment, syncMockAppStateFromStore } from "@/shared/api"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { uniqueId } from "@/shared/lib/ids"
import {
  FormLabel,
  Heading,
  Text,
  modalCloseIconClassName,
} from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

import { taskCreateFormSchema, type TaskCreateFormValues } from "../lib/taskCreateFormSchema"

import pageStyles from "./TaskCreatePage.module.css"

const PRIORITY_OPTIONS = ["P0", "P1", "P2"] as const

/** 담당자 Select 전용 — 목록 옵션 값과 충돌하지 않는 내부 토큰 */
const ASSIGNEE_SELECT_CLEAR_VALUE = "__task_create_assignee_clear__"

const filterLabelWithGap = cn(
  filterFieldLabelStyles.filterFieldLabel,
  filterFieldLabelStyles.filterFieldLabelGapBelow
)

type TaskDraftComment = {
  id: string
  author: string
  body: string
  createdAt: string
}

type TaskLocalHistoryEntry = {
  id: string
  summary: string
  actor: string
  createdAt: string
}

/** 연관 태스크/프로젝트는 도메인 모델에 없어 UI 상태로만 유지한다. */
export const TaskCreatePage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()
  const domains = useAppStore((s) => s.domains)
  const items = useAppStore((s) => s.items)
  const createItem = useAppStore((s) => s.createItem)
  const toggleLockSelectedItem = useAppStore((s) => s.toggleLockSelectedItem)

  const defaultDomain = useMemo(
    () => walkDomainsFlatForClassificationSelect(domains)[0]?.id ?? "",
    [domains],
  )

  const domainOptions = useMemo(
    () =>
      walkDomainsFlatForClassificationSelect(domains).map((d) => ({
        value: d.id,
        label: getDomainOptionLabel(domains, d.id),
      })),
    [domains],
  )

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const dueDateControlId = useId()
  const assigneeSelectId = useId()
  const assigneeDialogTitleId = useId()
  const relatedDialogTitleId = useId()
  const commentDetailDialogTitleId = useId()

  const authUser = useAuthSessionStore((s) => s.user)
  const commentAuthorityLabel = useMemo(() => {
    if (!authUser) return "틴토랩 PM"
    const org = authUser.organization?.trim()
    return `${authUser.displayName} | ${org || "—"}`
  }, [authUser])

  const historyActorLabel = useMemo(() => {
    const n = authUser?.displayName?.trim()
    return n || "틴토랩 사용자"
  }, [authUser])

  const ownerSelectOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const item of items) {
      const o = item.owner?.trim()
      if (o) seen.add(o)
    }
    return [...seen].sort((a, b) => a.localeCompare(b, "ko")).map((o) => ({ value: o, label: o }))
  }, [items])

  const assigneeSelectItems = useMemo(
    () =>
      Object.fromEntries(ownerSelectOptions.map((o) => [o.value, o.label])) as Record<
        string,
        ReactNode
      >,
    [ownerSelectOptions],
  )

  /** Base UI Select — `items`가 있어야 트리거에 한글 라벨이 표시됨(값 키 노출 방지) */
  const typeSelectItems = useMemo(
    () =>
      Object.fromEntries(ITEM_TYPE_VALUES.map((t) => [t, TYPE_LABELS[t] ?? t])) as Record<
        string,
        ReactNode
      >,
    []
  )
  const domainSelectItems = useMemo(
    () =>
      Object.fromEntries(domainOptions.map((o) => [o.value, o.label])) as Record<string, ReactNode>,
    [domainOptions]
  )
  const prioritySelectItems = useMemo(
    () => Object.fromEntries(PRIORITY_OPTIONS.map((p) => [p, p])) as Record<string, ReactNode>,
    []
  )
  const statusSelectItems = useMemo(
    () =>
      Object.fromEntries(STATUS_VALUES.map((st) => [st, STATUS_LABELS[st]])) as Record<
        string,
        ReactNode
      >,
    []
  )

  const [assignees, setAssignees] = useState<string[]>([])
  const [assigneePicker, setAssigneePicker] = useState("")
  const [relatedLabels, setRelatedLabels] = useState<string[]>([])
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [relatedOpen, setRelatedOpen] = useState(false)
  const [assigneeNameDraft, setAssigneeNameDraft] = useState("")
  const [assigneeOrgDraft, setAssigneeOrgDraft] = useState("")
  const [relatedDraft, setRelatedDraft] = useState("")
  const [draftComments, setDraftComments] = useState<TaskDraftComment[]>([])
  const [commentDraftBody, setCommentDraftBody] = useState("")
  const [commentDraftSubmitting, setCommentDraftSubmitting] = useState(false)
  const [activeDraftDetail, setActiveDraftDetail] = useState<TaskDraftComment | null>(null)
  const [localHistory, setLocalHistory] = useState<TaskLocalHistoryEntry[]>([])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskCreateFormValues>({
    resolver: zodResolver(taskCreateFormSchema),
    defaultValues: {
      title: "",
      type: "decision",
      domain: defaultDomain,
      priority: "P1",
      status: "논의",
      dueDate: "",
      description: "",
      clientResponse: "",
      finalConfirmedValue: "",
    },
  })

  useEffect(() => {
    if (defaultDomain) {
      setValue("domain", defaultDomain)
    }
  }, [defaultDomain, setValue])

  const watchedType = useWatch({ control, name: "type" })

  const previewCode = useMemo(
    () => getNextItemCode(items, watchedType as ItemType),
    [items, watchedType]
  )

  const ownerJoined = useMemo(() => assignees.join(" | "), [assignees])

  const buildPayload = (data: TaskCreateFormValues) => ({
    type: data.type,
    domain: data.domain,
    priority: data.priority,
    owner: ownerJoined,
    dueDate: data.dueDate,
    title: data.title,
    description: data.description,
    clientResponse: data.clientResponse,
    finalConfirmedValue: data.finalConfirmedValue,
  })

  const handleNavigateList = () => {
    navigate(paths.tasks)
  }

  const draftCommentsForCreate = useMemo(
    () =>
      draftComments.map((c) => ({
        author: c.author,
        body: c.body,
        createdAt: c.createdAt,
      })),
    [draftComments],
  )

  const handleSave = handleSubmit((data) => {
    const id = createItem({
      ...buildPayload(data),
      status: data.status,
      initialComments: draftCommentsForCreate,
    })
    if (!id) return
    setDraftComments([])
    setCommentDraftBody("")
    setLocalHistory([])
    void syncMockAppStateFromStore().catch((err) => {
      console.error("[task-create] mock app-state sync failed", err)
    })
    navigate(paths.tasks)
  })

  const handleFinalize = handleSubmit((data) => {
    const id = createItem({
      ...buildPayload(data),
      status: "방향합의",
      initialComments: draftCommentsForCreate,
    })
    if (!id) return
    setDraftComments([])
    setCommentDraftBody("")
    setLocalHistory([])
    const ok = toggleLockSelectedItem()
    void syncMockAppStateFromStore().catch((err) => {
      console.error("[task-create] mock app-state sync failed", err)
    })
    if (ok) navigate(paths.tasks)
  })

  const handleAddDraftComment = async () => {
    const body = commentDraftBody.trim()
    if (!body) {
      window.alert("질문, 보완 요청, 회의 메모 등 코멘트 내용을 입력해 주세요.")
      return
    }
    setCommentDraftSubmitting(true)
    try {
      const created = await postTaskDraftComment({
        author: commentAuthorityLabel,
        body,
      })
      setDraftComments((prev) => [
        ...prev,
        {
          id: created.id,
          author: created.author,
          body: created.body,
          createdAt: created.createdAt,
        },
      ])
      setLocalHistory((prev) => [
        {
          id: uniqueId("LH"),
          summary: `${previewCode} 항목에 코멘트`,
          actor: historyActorLabel,
          createdAt: created.createdAt,
        },
        ...prev,
      ])
      setCommentDraftBody("")
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "코멘트 저장 요청에 실패했습니다.",
      )
    } finally {
      setCommentDraftSubmitting(false)
    }
  }

  const handleAssigneePlus = () => {
    const v = assigneePicker.trim()
    if (v) {
      setAssignees((prev) => (prev.includes(v) ? prev : [...prev, v]))
      setAssigneePicker("")
      return
    }
    setAssigneeOpen(true)
  }

  const handleAddAssignee = () => {
    const name = assigneeNameDraft.trim()
    const org = assigneeOrgDraft.trim()
    if (!name && !org) return
    const v = name && org ? `${name} | ${org}` : name || org
    setAssignees((prev) => (prev.includes(v) ? prev : [...prev, v]))
    setAssigneeNameDraft("")
    setAssigneeOrgDraft("")
    setAssigneeOpen(false)
  }

  const handleRemoveAssignee = (index: number) => {
    setAssignees((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddRelated = () => {
    const v = relatedDraft.trim()
    if (!v) return
    setRelatedLabels((prev) => [...prev, v])
    setRelatedDraft("")
    setRelatedOpen(false)
  }

  const handleRemoveRelated = (index: number) => {
    setRelatedLabels((prev) => prev.filter((_, i) => i !== index))
  }

  const { ref: titleRegisterRef, ...titleRegisterRest } = register("title")

  const handleTitleTopPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const input = titleInputRef.current
    if (!input) return
    const t = e.target as Node
    if (t === input || input.contains(t)) return
    e.preventDefault()
    input.focus()
  }

  return (
    <section className={pageStyles.page} aria-label="새 태스크 작성">
      <Card variant="panel" className={pageStyles.mainCardInner}>
        <div className={pageStyles.firstWidgetBlock}>
          <div
            className={pageStyles.firstWidgetTop}
            onPointerDown={handleTitleTopPointerDown}
          >
            <p className={pageStyles.itemNumbering} aria-label="신규 항목 코드 미리보기">
              {previewCode}
            </p>
            <Input
              id="task-new-title"
              type="text"
              autoComplete="off"
              className={cn(pageStyles.firstWidgetTitleInput, "shadow-none")}
              placeholder="제목을 입력해 주세요."
              aria-label="제목"
              aria-invalid={errors.title ? true : undefined}
              {...titleRegisterRest}
              ref={(el) => {
                titleRegisterRef(el)
                titleInputRef.current = el
              }}
            />
            {errors.title ? (
              <p className={pageStyles.errorText} role="alert">
                {errors.title.message}
              </p>
            ) : null}
          </div>
          <div className={pageStyles.metaGrid}>
            <div className={pageStyles.fieldStack}>
              <label className={filterLabelWithGap} htmlFor="task-new-type">
                유형
              </label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={typeSelectItems}
                    onValueChange={(v) => {
                      field.onChange(v as ItemType)
                    }}
                  >
                    <SelectTrigger
                      id="task-new-type"
                      className={pageStyles.metaSelectTrigger}
                      aria-invalid={Boolean(errors.type)}
                    >
                      <SelectValue placeholder="유형을 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {ITEM_TYPE_VALUES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type ? (
                <p className={pageStyles.errorText} role="alert">
                  {errors.type.message}
                </p>
              ) : null}
            </div>

            <div className={pageStyles.fieldStack}>
              <label className={filterLabelWithGap} htmlFor="task-new-domain">
                분류
              </label>
              <Controller
                control={control}
                name="domain"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={domainSelectItems}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="task-new-domain"
                      className={pageStyles.metaSelectTrigger}
                      aria-invalid={Boolean(errors.domain)}
                    >
                      <SelectValue placeholder="분류를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {domainOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.domain ? (
                <p className={pageStyles.errorText} role="alert">
                  {errors.domain.message}
                </p>
              ) : null}
            </div>

            <div className={pageStyles.fieldStack}>
              <label className={filterLabelWithGap} htmlFor="task-new-priority">
                우선순위
              </label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={prioritySelectItems}
                    onValueChange={(v) => field.onChange(v as TaskCreateFormValues["priority"])}
                  >
                    <SelectTrigger id="task-new-priority" className={pageStyles.metaSelectTrigger}>
                      <SelectValue placeholder="우선순위를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {PRIORITY_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className={pageStyles.fieldStack}>
              <label className={filterLabelWithGap} htmlFor="task-new-status">
                상태
              </label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={statusSelectItems}
                    onValueChange={(v) => field.onChange(v as TaskCreateFormValues["status"])}
                  >
                    <SelectTrigger id="task-new-status" className={pageStyles.metaSelectTrigger}>
                      <SelectValue placeholder="상태를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {STATUS_VALUES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className={pageStyles.fieldStack}>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <FilterDateField
                    controlId={dueDateControlId}
                    label="마감일"
                    placeholder="마감일을 선택해 주세요"
                    value={field.value}
                    onValueChange={field.onChange}
                    fullWidth
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className={pageStyles.assigneeRow}>
          <div className={pageStyles.assigneeLabelControl}>
            <p className={filterFieldLabelStyles.filterFieldLabel} id="task-assignees-label">
              담당자
            </p>
            <div className={pageStyles.assigneePickRow}>
              <div className={pageStyles.assigneeSelectField}>
                <Select
                  value={assigneePicker === "" ? null : assigneePicker}
                  items={assigneeSelectItems}
                  onValueChange={(v) => {
                    if (v === ASSIGNEE_SELECT_CLEAR_VALUE) {
                      setAssigneePicker("")
                      return
                    }
                    setAssigneePicker(v ?? "")
                  }}
                >
                  <SelectTrigger
                    id={assigneeSelectId}
                    className={pageStyles.metaSelectTrigger}
                    aria-labelledby="task-assignees-label"
                  >
                    <SelectValue placeholder="담당자를 선택해 주세요" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {ownerSelectOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                    {assigneePicker !== "" ? (
                      <>
                        <SelectSeparator />
                        <SelectItem value={ASSIGNEE_SELECT_CLEAR_VALUE}>
                          선택 해제
                        </SelectItem>
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={pageStyles.assigneePlusBtn}
                aria-label="선택한 담당자 추가. 목록이 비어 있으면 직접 입력"
                onClick={handleAssigneePlus}
              >
                <Plus className="size-5" strokeWidth={1.75} aria-hidden />
              </Button>
            </div>
          </div>
          <div className={pageStyles.badgeList} role="list" aria-labelledby="task-assignees-label">
            {assignees.map((label, index) => (
              <div key={`${label}-${index}`} className={pageStyles.badgeWithRemove} role="listitem">
                <Badge variant="pillDark">{label}</Badge>
                <button
                  type="button"
                  className={pageStyles.removeIconBtn}
                  aria-label={`담당자 ${label} 제거`}
                  onClick={() => handleRemoveAssignee(index)}
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div
        className={cn(
          pageStyles.sectionBar,
          pageStyles.relatedTasksBar,
          relatedLabels.length > 0 && pageStyles.relatedTasksBarWithChips,
        )}
        aria-label="연관 태스크 영역"
      >
        <div className={pageStyles.sectionBarLeft}>
          <p className={cn(filterFieldLabelStyles.filterFieldLabel, pageStyles.sectionBarTitle)}>
            연관 태스크
          </p>
          <div
            className={cn(pageStyles.sectionBarChips, pageStyles.relatedTasksChips)}
            role="list"
            aria-label="연관 태스크"
          >
            {relatedLabels.map((label, index) => (
              <div key={`${label}-${index}`} className={pageStyles.relatedTaskChip} role="listitem">
                <span className={pageStyles.relatedTaskChipText}>{label}</span>
                <button
                  type="button"
                  className={pageStyles.relatedTaskChipRemove}
                  aria-label={`연관 태스크 ${label} 제거`}
                  onClick={() => handleRemoveRelated(index)}
                >
                  <X className={pageStyles.relatedTaskChipIcon} strokeWidth={2} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>
        <Button
          type="button"
          appearance="fill"
          dimension="fixedMd"
          onClick={() => setRelatedOpen(true)}
          aria-haspopup="dialog"
        >
          연관 프로젝트 추가
        </Button>
      </div>

      <Card
        variant="panel"
        className={pageStyles.panelSection}
        aria-label="프로젝트 설명 및 고객 회신"
      >
        <div className={cn(pageStyles.twoCol, pageStyles.twoColEditorGap)}>
          <div className={pageStyles.editorColumn}>
            <p className={filterFieldLabelStyles.filterFieldLabel}>프로젝트 설명</p>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <MarkdownTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="프로젝트 설명을 입력해 주세요."
                  aria-label="프로젝트 설명"
                  className={pageStyles.taskMarkdownEditor}
                  minHeight="280px"
                  initialEditType="wysiwyg"
                  hideModeSwitch
                />
              )}
            />
          </div>
          <div className={pageStyles.editorColumn}>
            <p className={filterFieldLabelStyles.filterFieldLabel}>고객 회신 영역</p>
            <Controller
              control={control}
              name="clientResponse"
              render={({ field }) => (
                <MarkdownTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="고객 회신 내용을 입력해 주세요."
                  aria-label="고객 회신 영역"
                  className={pageStyles.taskMarkdownEditor}
                  minHeight="280px"
                  initialEditType="wysiwyg"
                  hideModeSwitch
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Card variant="panel" className={pageStyles.finalCard}>
        <label
          className={cn(filterFieldLabelStyles.filterFieldLabel, pageStyles.finalConfirmLabel)}
          htmlFor="task-final"
        >
          최종 확인값
        </label>
        <Input
          id="task-final"
          type="text"
          autoComplete="off"
          className={cn(pageStyles.finalConfirmInput, "shadow-none")}
          placeholder="최종 확인값을 입력해 주세요."
          aria-label="최종 확인값"
          {...register("finalConfirmedValue")}
        />
      </Card>

      <section className={pageStyles.commentHistorySection} aria-label="코멘트 및 변경 이력">
        <div className={pageStyles.commentHistoryGrid}>
          <div
            className={cn(pageStyles.commentHistoryPanel, pageStyles.commentHistoryPanelComments)}
            role="region"
            aria-label="코멘트"
          >
            <p className={pageStyles.commentHistoryPanelHead}>코멘트</p>
            <div className={pageStyles.commentDraftWriteAndListStack}>
              <div className={pageStyles.commentDraftCompose}>
                <div
                  className={pageStyles.commentDraftAssigneeZone}
                  role="group"
                  aria-label="담당자"
                >
                  <p className={pageStyles.commentDraftAssigneeLine}>
                    <span className={pageStyles.commentDraftAssigneeKey}>담당자</span>
                    <span className={pageStyles.commentDraftAssigneeSep} aria-hidden="true">
                      {" "}
                      :{" "}
                    </span>
                    <span className={pageStyles.commentDraftAssigneeValue}>
                      {commentAuthorityLabel}
                    </span>
                  </p>
                </div>
                <div className={pageStyles.commentDraftTextZone}>
                  <Textarea
                    value={commentDraftBody}
                    onChange={(e) => setCommentDraftBody(e.target.value)}
                    rows={5}
                    placeholder="질문, 보완 요청, 회의 메모를 입력하세요."
                    aria-label="코멘트 내용"
                    className={pageStyles.commentDraftTextarea}
                    disabled={commentDraftSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  appearance="outline"
                  dimension="hug"
                  disabled={commentDraftSubmitting}
                  onClick={() => void handleAddDraftComment()}
                >
                  코멘트 추가
                </Button>
              </div>
              <hr className={pageStyles.commentDraftDivider} aria-hidden="true" />
              <div className={pageStyles.commentDraftList}>
              {draftComments.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={pageStyles.commentDraftCard}
                  aria-label={`${c.author} 코멘트 상세 보기`}
                  onClick={() => setActiveDraftDetail(c)}
                >
                  <Text as="div" variant="commentAuthor">
                    {c.author}
                  </Text>
                  <Text as="div" variant="commentMeta">
                    {formatDateTime(c.createdAt)}
                  </Text>
                  <p className={pageStyles.commentDraftCardBody}>{c.body}</p>
                </button>
              ))}
              </div>
            </div>
          </div>
          <div
            className={cn(
              pageStyles.commentHistoryPanel,
              pageStyles.commentHistoryPanelHistory,
            )}
            role="region"
            aria-label="변경 이력"
          >
            <p className={pageStyles.commentHistoryPanelHead}>변경 이력</p>
            <div className={pageStyles.localHistoryList}>
              {localHistory.length === 0 ? (
                <Text as="p" variant="muted" className={pageStyles.localHistoryEmpty}>
                  작성 중인 코멘트는 여기에 기록됩니다. 저장 후에는 항목 상세에서 전체 이력을 확인할 수
                  있습니다.
                </Text>
              ) : (
                localHistory.map((h) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog.Root
        open={activeDraftDetail !== null}
        onOpenChange={(open) => {
          if (!open) setActiveDraftDetail(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal"
            aria-labelledby={commentDetailDialogTitleId}
            aria-describedby={undefined}
          >
            <div className="modal-head">
              <Dialog.Title asChild>
                <Heading as="h3" variant="modal" id={commentDetailDialogTitleId}>
                  코멘트 상세
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
            <AppModalBody>
              {activeDraftDetail ? (
                <div className={pageStyles.commentDetailCard}>
                  <Text as="div" variant="commentAuthor">
                    {activeDraftDetail.author}
                  </Text>
                  <Text as="div" variant="commentMeta">
                    {formatDateTime(activeDraftDetail.createdAt)}
                  </Text>
                  <p className={pageStyles.commentDetailBody}>{activeDraftDetail.body}</p>
                </div>
              ) : null}
            </AppModalBody>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className={pageStyles.footer}>
        <Button type="button" appearance="outline" dimension="fixedMd" onClick={handleNavigateList}>
          목록으로
        </Button>
        <div className={pageStyles.footerActions}>
          <Button type="button" appearance="outline" dimension="fixedMd" onClick={handleSave}>
            저장
          </Button>
          <Button type="button" appearance="fill" dimension="fixedMd" onClick={handleFinalize}>
            확정처리
          </Button>
        </div>
      </div>

      <Dialog.Root open={assigneeOpen} onOpenChange={setAssigneeOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal"
            aria-labelledby={assigneeDialogTitleId}
            aria-describedby={undefined}
          >
            <div className="modal-head">
              <Dialog.Title asChild>
                <Heading as="h3" variant="modal" id={assigneeDialogTitleId}>
                  담당자 추가
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
            <AppModalBody>
              <AppModalField>
                <div className={pageStyles.assigneeModalInputsRow}>
                  <div className={pageStyles.assigneeModalInputCell}>
                    <FormLabel htmlFor="assignee-name">이름</FormLabel>
                    <Input
                      id="assignee-name"
                      className={cn(pageStyles.filterFormControl, appModalStyles.singleLineField)}
                      value={assigneeNameDraft}
                      onChange={(e) => setAssigneeNameDraft(e.target.value)}
                      placeholder="예: 홍길동"
                      autoComplete="name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAssignee()
                        }
                      }}
                    />
                  </div>
                  <div className={pageStyles.assigneeModalInputCell}>
                    <FormLabel htmlFor="assignee-org">소속</FormLabel>
                    <Input
                      id="assignee-org"
                      className={cn(pageStyles.filterFormControl, appModalStyles.singleLineField)}
                      value={assigneeOrgDraft}
                      onChange={(e) => setAssigneeOrgDraft(e.target.value)}
                      placeholder="예: 설해원"
                      autoComplete="organization"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAssignee()
                        }
                      }}
                    />
                  </div>
                </div>
              </AppModalField>
              <AppModalActions>
                <Dialog.Close asChild>
                  <Button type="button" appearance="outline" dimension="fixedMd">
                    취소
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="fixedMd"
                  onClick={handleAddAssignee}
                >
                  추가
                </Button>
              </AppModalActions>
            </AppModalBody>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={relatedOpen} onOpenChange={setRelatedOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            className="modal"
            aria-labelledby={relatedDialogTitleId}
            aria-describedby={undefined}
          >
            <div className="modal-head">
              <Dialog.Title asChild>
                <Heading as="h3" variant="modal" id={relatedDialogTitleId}>
                  연관 프로젝트 추가
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
            <AppModalBody>
              <AppModalField>
                <FormLabel htmlFor="related-draft">표시 이름</FormLabel>
                <Input
                  id="related-draft"
                  className={cn(pageStyles.filterFormControl, appModalStyles.singleLineField)}
                  value={relatedDraft}
                  onChange={(e) => setRelatedDraft(e.target.value)}
                  placeholder="연관 항목 이름"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddRelated()
                    }
                  }}
                />
              </AppModalField>
              <AppModalActions>
                <Dialog.Close asChild>
                  <Button type="button" appearance="outline" dimension="fixedMd">
                    취소
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="fixedMd"
                  onClick={handleAddRelated}
                >
                  추가
                </Button>
              </AppModalActions>
            </AppModalBody>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
