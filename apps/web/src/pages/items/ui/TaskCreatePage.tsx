import * as Dialog from "@radix-ui/react-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronDown, Plus, X } from "lucide-react"
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
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import { useProjectRouteSlug } from "@/shared/lib/projectRouteSlug"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import { useAuthSessionStore } from "@/features/auth"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import { getNextItemCode } from "@/entities/item/lib/nextItemCode"
import { PRIORITY_VALUES, type ItemType } from "@/entities/item/model/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS, STATUS_VALUES, TYPE_LABELS } from "@/shared/constants/labels"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"
import { FilterDateField, filterFieldLabelStyles } from "@/shared/ui/filter-field"
import panelStyles from "@/shared/ui/filter-field/FilterDropdownPanel.module.css"
import { AppModalBody } from "@/shared/ui/app-modal"
import { Card } from "@/shared/ui/card"
import { MarkdownTextEditor } from "@/shared/ui/markdown-text-editor"
import type { Comment } from "@/entities/comment/model/types"
import { postItemComment, postTaskDraftComment, syncMockAppStateFromStore } from "@/shared/api"
import { appAlert } from "@/shared/lib/appDialog"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { uniqueId } from "@/shared/lib/ids"
import { useHorizontalScrollStrip } from "@/shared/lib/useHorizontalScrollStrip"
import { Heading, Text, modalCloseIconClassName } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

import { getStatusOptionsForItem } from "../lib/itemStatusOptions"
import {
  taskEditFormSchema,
  taskNewFormSchema,
  type TaskCreateFormValues,
} from "../lib/taskCreateFormSchema"

import { TaskParticipantSearchModal } from "./TaskParticipantSearchModal"
import { RelatedTasksSearchModal } from "./RelatedTasksSearchModal"
import pageStyles from "./TaskCreatePage.module.css"

const EMPTY_STRING_ARRAY: string[] = []

const parseAssigneesFromOwner = (owner: string): string[] =>
  owner
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

const parseAssigneesFromOwner = (owner: string): string[] =>
  owner
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

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
  const { itemId } = useParams<{ itemId: string }>()
  const isEditMode = Boolean(itemId)
  const paths = useProjectScopedPaths()
  const projectSlug = useProjectRouteSlug()
  const domains = useAppStore((s) => s.domains)
  const items = useAppStore((s) => s.items)
  const comments = useAppStore((s) => s.comments)
  const history = useAppStore((s) => s.history)
  const createItem = useAppStore((s) => s.createItem)
  const getItemById = useAppStore((s) => s.getItemById)
  const selectItem = useAppStore((s) => s.selectItem)
  const saveSelectedItem = useAppStore((s) => s.saveSelectedItem)
  const addCommentFromApi = useAppStore((s) => s.addCommentFromApi)
  const toggleLockSelectedItem = useAppStore((s) => s.toggleLockSelectedItem)

  const editItem = useMemo(() => {
    if (!itemId) return undefined
    return getItemById(itemId)
  }, [itemId, getItemById, items])

  const defaultDomain = useMemo(
    () => walkDomainsFlatForClassificationSelect(domains)[0]?.id ?? "",
    [domains]
  )

  const domainOptions = useMemo(
    () =>
      walkDomainsFlatForClassificationSelect(domains).map((d) => ({
        value: d.id,
        label: getDomainOptionLabel(domains, d.id),
      })),
    [domains]
  )

  const relatedTasksChipsScroll = useHorizontalScrollStrip()
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const assigneePickerAnchorRef = useRef<HTMLDivElement | null>(null)
  const assigneeChipsScrollRef = useRef<HTMLDivElement | null>(null)
  const assigneeChipsDragRef = useRef<{
    active: boolean
    pointerId: number | null
    startX: number
    scrollLeft: number
  }>({ active: false, pointerId: null, startX: 0, scrollLeft: 0 })
  const dueDateControlId = useId()
  const assigneeSelectId = useId()
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
    () => Object.fromEntries(PRIORITY_VALUES.map((p) => [p, p])) as Record<string, ReactNode>,
    []
  )

  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false)
  /** 참여인원 검색으로만 채우는 담당자 필터(드롭다운) 옵션 — 폼 담당자 칩과 별도 */
  const [assigneeFilterExtras, setAssigneeFilterExtras] = useState<string[]>([])
  const [participantSearchOpen, setParticipantSearchOpen] = useState(false)
  const [relatedOpen, setRelatedOpen] = useState(false)
  const [draftComments, setDraftComments] = useState<TaskDraftComment[]>([])
  const [commentDraftBody, setCommentDraftBody] = useState("")
  const [commentDraftSubmitting, setCommentDraftSubmitting] = useState(false)
  const [activeDraftDetail, setActiveDraftDetail] = useState<
    TaskDraftComment | Comment | null
  >(null)
  const [localHistory, setLocalHistory] = useState<TaskLocalHistoryEntry[]>([])

  const statusRowValues = useMemo(() => {
    if (isEditMode && editItem) return getStatusOptionsForItem(editItem)
    return [...STATUS_VALUES]
  }, [isEditMode, editItem])

  const statusSelectItems = useMemo(
    () =>
      Object.fromEntries(statusRowValues.map((st) => [st, STATUS_LABELS[st]])) as Record<
        string,
        ReactNode
      >,
    [statusRowValues]
  )

  const itemCommentsForEdit = useMemo(() => {
    if (!isEditMode || !itemId) return []
    return comments
      .filter((c) => c.itemId === itemId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
  }, [isEditMode, itemId, comments])

  const itemHistoryForEdit = useMemo(() => {
    if (!isEditMode || !itemId) return []
    return history
      .filter((h) => h.itemId === itemId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }, [isEditMode, itemId, history])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<TaskCreateFormValues>({
    resolver: zodResolver(isEditMode ? taskEditFormSchema : taskNewFormSchema),
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
      assignees: [],
      relatedLabels: [],
    },
  })

  const assignees = useWatch({ control, name: "assignees" }) ?? EMPTY_STRING_ARRAY
  const relatedLabels = useWatch({ control, name: "relatedLabels" }) ?? EMPTY_STRING_ARRAY

  /** 기존 항목 owner + 참여인원 검색으로 넣은 필터 전용 라벨 */
  const assigneePoolOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const o of ownerSelectOptions) {
      map.set(o.value, o.label)
    }
    for (const label of assigneeFilterExtras) {
      const key = label.trim()
      if (key.length > 0 && !map.has(key)) map.set(key, key)
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "ko"))
      .map(([value, label]) => ({ value, label }))
  }, [ownerSelectOptions, assigneeFilterExtras])

  const formLocked =
    isEditMode && editItem ? editItem.status === "확정" || editItem.isLocked : false

  useEffect(() => {
    if (!isEditMode || !itemId) return
    selectItem(itemId)
    return () => selectItem(null)
  }, [isEditMode, itemId, selectItem])

  useEffect(() => {
    if (!isEditMode || !editItem) return
    reset({
      title: editItem.title,
      type: editItem.type,
      domain: editItem.domain,
      priority: editItem.priority,
      status: editItem.status,
      dueDate: editItem.dueDate,
      description: editItem.description,
      clientResponse: editItem.clientResponse,
      finalConfirmedValue: editItem.finalConfirmedValue,
      assignees: parseAssigneesFromOwner(editItem.owner),
      relatedLabels: [],
    })
    setDraftComments([])
    setCommentDraftBody("")
    setLocalHistory([])
    setAssigneeFilterExtras([])
  }, [isEditMode, editItem, reset])

  useEffect(() => {
    if (isEditMode) return
    if (defaultDomain) {
      setValue("domain", defaultDomain)
    }
  }, [defaultDomain, setValue, isEditMode])

  const watchedType = useWatch({ control, name: "type" })

  const previewCode = useMemo(() => {
    if (isEditMode && editItem) return editItem.code
    return getNextItemCode(items, watchedType as ItemType)
  }, [isEditMode, editItem, items, watchedType])

  const buildPayload = (data: TaskCreateFormValues) => ({
    type: data.type,
    domain: data.domain,
    priority: data.priority,
    owner: data.assignees.join(" | "),
    dueDate: data.dueDate,
    title: data.title,
    description: data.description,
    clientResponse: data.clientResponse,
    finalConfirmedValue: data.finalConfirmedValue,
  })

  const handleNavigateList = () => {
    selectItem(null)
    navigate(paths.tasks)
  }

  const draftCommentsForCreate = useMemo(
    () =>
      draftComments.map((c) => ({
        author: c.author,
        body: c.body,
        createdAt: c.createdAt,
      })),
    [draftComments]
  )

  const handleSave = handleSubmit(async (data) => {
    if (isEditMode) {
      const ok = await saveSelectedItem({
        type: data.type,
        title: data.title,
        domain: data.domain,
        priority: data.priority,
        status: data.status,
        owner: data.assignees.join(" | "),
        dueDate: data.dueDate,
        description: data.description,
        clientResponse: data.clientResponse,
        finalConfirmedValue: data.finalConfirmedValue,
      })
      if (!ok) return
      void syncMockAppStateFromStore().catch((err) => {
        console.error("[task-edit] mock app-state sync failed", err)
      })
      navigate(paths.tasks)
      return
    }
    const id = await createItem({
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

  const handleFinalize = handleSubmit(async (data) => {
    if (isEditMode) {
      const ok = await saveSelectedItem({
        type: data.type,
        title: data.title,
        domain: data.domain,
        priority: data.priority,
        status: "방향합의",
        owner: data.assignees.join(" | "),
        dueDate: data.dueDate,
        description: data.description,
        clientResponse: data.clientResponse,
        finalConfirmedValue: data.finalConfirmedValue,
      })
      if (!ok) return
      void syncMockAppStateFromStore().catch((err) => {
        console.error("[task-edit] mock app-state sync failed", err)
      })
      const lockOk = await toggleLockSelectedItem()
      if (lockOk) navigate(paths.tasks)
      return
    }
    const id = await createItem({
      ...buildPayload(data),
      status: "방향합의",
      initialComments: draftCommentsForCreate,
    })
    if (!id) return
    setDraftComments([])
    setCommentDraftBody("")
    setLocalHistory([])
    const ok = await toggleLockSelectedItem()
    void syncMockAppStateFromStore().catch((err) => {
      console.error("[task-create] mock app-state sync failed", err)
    })
    if (ok) navigate(paths.tasks)
  })

  const handleAddDraftComment = async () => {
    const body = commentDraftBody.trim()
    if (!body) {
      await appAlert("질문, 보완 요청, 회의 메모 등 코멘트 내용을 입력해 주세요.")
      return
    }
    if (isEditMode && itemId) {
      setCommentDraftSubmitting(true)
      try {
        const comment = await postItemComment(itemId, {
          author: commentAuthorityLabel,
          body,
        })
        const ok = await addCommentFromApi(comment)
        if (ok) {
          setCommentDraftBody("")
          void syncMockAppStateFromStore().catch((err) => {
            console.error("[task-edit] mock app-state sync failed", err)
          })
        }
      } catch (err) {
        await appAlert(
          err instanceof Error ? err.message : "코멘트 저장 요청에 실패했습니다.",
        )
      } finally {
        setCommentDraftSubmitting(false)
      }
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
      await appAlert(err instanceof Error ? err.message : "코멘트 저장 요청에 실패했습니다.")
    } finally {
      setCommentDraftSubmitting(false)
    }
  }

  const handleAssigneePlus = () => {
    setParticipantSearchOpen(true)
  }

  const handleParticipantSearchConfirm = (labels: string[]) => {
    setAssigneeFilterExtras((prev) => {
      const next = [...prev]
      for (const label of labels) {
        if (!next.includes(label)) next.push(label)
      }
      return next
    })
  }

  const handleAssigneePoolToggle = (value: string) => {
    const current = getValues("assignees") ?? []
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value]
    setValue("assignees", next, { shouldDirty: true, shouldValidate: true })
  }

  const handleRemoveAssignee = (index: number) => {
    setValue(
      "assignees",
      assignees.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const ASSIGNEE_CHIPS_SCROLL_MIN = 5

  const handleAssigneeChipsPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (assignees.length < ASSIGNEE_CHIPS_SCROLL_MIN) return
    if (e.button !== 0) return
    const t = e.target as HTMLElement
    if (t.closest("button")) return
    const el = assigneeChipsScrollRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    assigneeChipsDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
  }

  const handleAssigneeChipsPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = assigneeChipsDragRef.current
    if (!d.active || d.pointerId !== e.pointerId) return
    const el = assigneeChipsScrollRef.current
    if (!el) return
    el.scrollLeft = d.scrollLeft - (e.clientX - d.startX)
  }

  const handleAssigneeChipsPointerUpOrCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = assigneeChipsDragRef.current
    if (!d.active || d.pointerId !== e.pointerId) return
    const el = assigneeChipsScrollRef.current
    try {
      el?.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    assigneeChipsDragRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      scrollLeft: 0,
    }
  }

  const handleRelatedTasksConfirm = (labels: string[]) => {
    const merged = [...relatedLabels]
    for (const label of labels) {
      if (!merged.includes(label)) merged.push(label)
    }
    setValue("relatedLabels", merged, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleRemoveRelated = (index: number) => {
    setValue(
      "relatedLabels",
      relatedLabels.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    )
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

  if (isEditMode && itemId && !editItem) {
    return <Navigate to={paths.tasks} replace />
  }

  const pageAriaLabel = isEditMode ? "태스크 상세" : "새 태스크 작성"
  const codeAriaLabel = isEditMode ? "항목 코드" : "신규 항목 코드 미리보기"

  const commentRows = isEditMode ? itemCommentsForEdit : draftComments

  return (
    <section className={pageStyles.page} aria-label={pageAriaLabel}>
      <Card variant="panel" className={pageStyles.mainCardInner}>
        <div className={pageStyles.firstWidgetBlock}>
          <div className={pageStyles.firstWidgetTop} onPointerDown={handleTitleTopPointerDown}>
            <p className={pageStyles.itemNumbering} aria-label={codeAriaLabel}>
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
              disabled={formLocked}
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
                    disabled={formLocked}
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
                    disabled={formLocked}
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
                    disabled={formLocked}
                    onValueChange={(v) => field.onChange(v as TaskCreateFormValues["priority"])}
                  >
                    <SelectTrigger
                      id="task-new-priority"
                      className={pageStyles.metaSelectTrigger}
                      aria-invalid={Boolean(errors.priority)}
                    >
                      <SelectValue placeholder="우선순위를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {PRIORITY_VALUES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority ? (
                <p className={pageStyles.errorText} role="alert">
                  {errors.priority.message}
                </p>
              ) : null}
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
                    disabled={formLocked}
                    onValueChange={(v) => field.onChange(v as TaskCreateFormValues["status"])}
                  >
                    <SelectTrigger
                      id="task-new-status"
                      className={pageStyles.metaSelectTrigger}
                      aria-invalid={Boolean(errors.status)}
                    >
                      <SelectValue placeholder="상태를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {statusRowValues.map((st) => (
                        <SelectItem key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status ? (
                <p className={pageStyles.errorText} role="alert">
                  {errors.status.message}
                </p>
              ) : null}
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
                    disabled={formLocked}
                  />
                )}
              />
              {errors.dueDate ? (
                <p className={pageStyles.errorText} role="alert">
                  {errors.dueDate.message}
                </p>
              ) : null}
            </div>

            <div className={pageStyles.assigneeSubgridRow}>
              <div className={pageStyles.assigneeLabelControl}>
                <p className={filterFieldLabelStyles.filterFieldLabel} id="task-assignees-label">
                  담당자
                </p>
                <div className={pageStyles.assigneePickRow}>
                  <div ref={assigneePickerAnchorRef} className={pageStyles.assigneeSelectField}>
                    <Popover open={assigneeMenuOpen} onOpenChange={setAssigneeMenuOpen} modal={false}>
                      <PopoverTrigger
                        id={assigneeSelectId}
                        type="button"
                        disabled={formLocked}
                        aria-labelledby="task-assignees-label"
                        aria-haspopup="listbox"
                        aria-expanded={assigneeMenuOpen}
                        className={cn(
                          pageStyles.metaSelectTrigger,
                          "inline-flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left shadow-none outline-none select-none",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          assignees.length === 0 && "text-muted-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {assignees.length === 0
                            ? "담당자를 선택해 주세요"
                            : assignees.length === 1
                              ? assignees[0]
                              : `${assignees.length}명 선택`}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground opacity-50 transition-transform duration-200",
                            assigneeMenuOpen && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        matchTriggerWidth
                        anchor={assigneePickerAnchorRef}
                        className="gap-0 border border-border p-0 shadow-md ring-0"
                        align="start"
                        side="bottom"
                        sideOffset={6}
                      >
                        <div
                          className={panelStyles.optionList}
                          role="listbox"
                          aria-label="담당자 옵션"
                          aria-multiselectable="true"
                        >
                          {assigneePoolOptions.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-muted-foreground">
                              목록에 담당자가 없습니다. + 버튼으로 참여인원 검색에서 추가할 수 있습니다.
                            </p>
                          ) : (
                            assigneePoolOptions.map((opt) => {
                              const isOn = assignees.includes(opt.value)
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  role="option"
                                  aria-selected={isOn}
                                  aria-checked={isOn}
                                  className={panelStyles.optionRow}
                                  onClick={() => handleAssigneePoolToggle(opt.value)}
                                >
                                  <span className={panelStyles.optionLabel}>{opt.label}</span>
                                  <span className={panelStyles.optionIndicator} aria-hidden>
                                    {isOn ? <Check className="size-4" strokeWidth={2.5} /> : null}
                                  </span>
                                </button>
                              )
                            })
                          )}
                        </div>
                        {assignees.length > 0 ? (
                          <div className={panelStyles.popoverFooter}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setValue("assignees", [], {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setAssigneeMenuOpen(false)
                              }}
                            >
                              담당자 전체 해제
                            </Button>
                          </div>
                        ) : null}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className={pageStyles.assigneePlusAndChips}>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={pageStyles.assigneePlusBtn}
                      aria-label="참여인원 검색"
                      disabled={formLocked}
                      onClick={handleAssigneePlus}
                    >
                      <Plus className="size-5" strokeWidth={1.75} aria-hidden />
                    </Button>
                    <div
                      ref={assigneeChipsScrollRef}
                      className={cn(
                        pageStyles.badgeList,
                        assignees.length >= ASSIGNEE_CHIPS_SCROLL_MIN && pageStyles.assigneeChipsScroll,
                      )}
                      role="list"
                      aria-labelledby="task-assignees-label"
                      onPointerDown={handleAssigneeChipsPointerDown}
                      onPointerMove={handleAssigneeChipsPointerMove}
                      onPointerUp={handleAssigneeChipsPointerUpOrCancel}
                      onPointerCancel={handleAssigneeChipsPointerUpOrCancel}
                      onPointerLeave={(e) => {
                        if (!assigneeChipsDragRef.current.active) return
                        if (e.buttons === 0) handleAssigneeChipsPointerUpOrCancel(e)
                      }}
                    >
                      {assignees.map((label, index) => (
                        <div
                          key={`${label}-${index}`}
                          className={pageStyles.relatedTaskChip}
                          role="listitem"
                        >
                          <span className={pageStyles.relatedTaskChipText}>{label}</span>
                          <button
                            type="button"
                            className={pageStyles.relatedTaskChipRemove}
                            aria-label={`담당자 ${label} 제거`}
                            disabled={formLocked}
                            onClick={() => handleRemoveAssignee(index)}
                          >
                            <X
                              className={pageStyles.relatedTaskChipIcon}
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.assignees ? (
                  <p className={pageStyles.errorText} role="alert">
                    {errors.assignees.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <>
        <div
          className={cn(
            pageStyles.sectionBar,
            pageStyles.relatedTasksBar,
            relatedLabels.length > 0 && pageStyles.relatedTasksBarWithChips
          )}
          aria-label="연관 태스크 영역"
        >
          <div className={pageStyles.sectionBarLeft}>
            <p className={cn(filterFieldLabelStyles.filterFieldLabel, pageStyles.sectionBarTitle)}>
              연관 태스크
            </p>
            <div
              ref={relatedTasksChipsScroll.ref}
              className={cn(pageStyles.sectionBarChips, pageStyles.relatedTasksChips)}
              role="list"
              aria-label="연관 태스크"
              onPointerDown={relatedTasksChipsScroll.onPointerDown}
              onPointerMove={relatedTasksChipsScroll.onPointerMove}
              onPointerUp={relatedTasksChipsScroll.onPointerUp}
              onPointerLeave={relatedTasksChipsScroll.onPointerLeave}
              onPointerCancel={relatedTasksChipsScroll.onPointerCancel}
            >
              {relatedLabels.map((label, index) => (
                <div key={`${label}-${index}`} className={pageStyles.relatedTaskChip} role="listitem">
                  <span className={pageStyles.relatedTaskChipText}>{label}</span>
                  <button
                    type="button"
                    className={pageStyles.relatedTaskChipRemove}
                    aria-label={`연관 태스크 ${label} 제거`}
                    disabled={formLocked}
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
            disabled={formLocked}
            onClick={() => setRelatedOpen(true)}
            aria-haspopup="dialog"
          >
            연간 Task 추가
          </Button>
        </div>
        {errors.relatedLabels ? (
          <p className={pageStyles.errorText} role="alert">
            {errors.relatedLabels.message}
          </p>
        ) : null}
      </>

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
                  disabled={formLocked}
                />
              )}
            />
            {errors.description ? (
              <p className={pageStyles.errorText} role="alert">
                {errors.description.message}
              </p>
            ) : null}
          </div>
          <div className={pageStyles.editorColumn}>
            <p className={filterFieldLabelStyles.filterFieldLabel}>고객 회신 영역 (선택)</p>
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
                  disabled={formLocked}
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
          최종 확인값 (선택)
        </label>
        <Input
          id="task-final"
          type="text"
          autoComplete="off"
          className={cn(pageStyles.finalConfirmInput, "shadow-none")}
          placeholder="최종 확인값을 입력해 주세요."
          aria-label="최종 확인값"
          disabled={formLocked}
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
            <p className={pageStyles.commentHistoryPanelHead}>코멘트 (선택)</p>
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
                    disabled={formLocked || commentDraftSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  appearance="outline"
                  dimension="hug"
                  disabled={formLocked || commentDraftSubmitting}
                  onClick={() => void handleAddDraftComment()}
                >
                  코멘트 추가
                </Button>
              </div>
              <hr className={pageStyles.commentDraftDivider} aria-hidden="true" />
              <div className={pageStyles.commentDraftList}>
                {commentRows.map((c) => (
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
            className={cn(pageStyles.commentHistoryPanel, pageStyles.commentHistoryPanelHistory)}
            role="region"
            aria-label="변경 이력"
          >
            <p className={pageStyles.commentHistoryPanelHead}>변경 이력</p>
            <div className={pageStyles.localHistoryList}>
              {isEditMode ? (
                itemHistoryForEdit.length === 0 ? (
                  <Text as="p" variant="muted" className={pageStyles.localHistoryEmpty}>
                    변경 이력이 없습니다.
                  </Text>
                ) : (
                  itemHistoryForEdit.map((h) => (
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
                )
              ) : localHistory.length === 0 ? (
                <Text as="p" variant="muted" className={pageStyles.localHistoryEmpty}>
                  작성 중인 코멘트는 여기에 기록됩니다. 저장 후에는 항목 상세에서 전체 이력을 확인할
                  수 있습니다.
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
          <Button
            type="button"
            appearance="outline"
            dimension="fixedMd"
            disabled={formLocked}
            onClick={handleSave}
          >
            저장
          </Button>
          <Button
            type="button"
            appearance="fill"
            dimension="fixedMd"
            disabled={formLocked}
            onClick={handleFinalize}
          >
            확정처리
          </Button>
        </div>
      </div>

      <TaskParticipantSearchModal
        open={participantSearchOpen}
        onOpenChange={setParticipantSearchOpen}
        projectSlug={projectSlug}
        onConfirm={handleParticipantSearchConfirm}
        disabled={formLocked}
      />

      <RelatedTasksSearchModal
        open={relatedOpen}
        onOpenChange={setRelatedOpen}
        onConfirm={handleRelatedTasksConfirm}
      />
    </section>
  )
}
