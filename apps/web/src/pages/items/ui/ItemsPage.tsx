import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import clsx from "clsx"
import { useAppStore } from "@/app/store/useAppStore"
import type { Item } from "@/entities/item/model/types"
import type { ItemStatus } from "@/shared/constants/labels"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  STATUS_VALUES,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import {
  getDomainOptionLabel,
  walkDomainsFlat,
} from "@/entities/domain/lib/domainTree"
import { itemMatchesSearch } from "@/shared/lib/itemSearch"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { ItemsFiltersRow } from "./filters/ItemsFiltersRow"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import {
  FormLabel,
  Heading,
  Text,
} from "@/shared/ui/typography"

const listItemCardInteractiveClass =
  "cursor-pointer outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

type DetailForm = {
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

const getStatusOptionsForItem = (current: Item | undefined): ItemStatus[] => {
  if (!current) return [...STATUS_VALUES]
  if (current.status === "확정") return ["확정"]
  if (current.status === "방향합의")
    return ["논의", "방향합의", "확정"]
  return ["논의", "방향합의"]
}

export const ItemsPage = () => {
  const domains = useAppStore((s) => s.domains)
  const allItems = useAppStore((s) => s.items)
  const itemsQuery = useAppStore((s) => s.ui.itemsQuery)
  const typeFilter = useAppStore((s) => s.ui.typeFilter)
  const domainFilter = useAppStore((s) => s.ui.domainFilter)
  const statusFilter = useAppStore((s) => s.ui.statusFilter)
  const priorityFilter = useAppStore((s) => s.ui.priorityFilter)
  const dueDateFilter = useAppStore((s) => s.ui.dueDateFilter)
  const selectedItemId = useAppStore((s) => s.ui.selectedItemId)
  const comments = useAppStore((s) => s.comments)
  const history = useAppStore((s) => s.history)

  const selectItem = useAppStore((s) => s.selectItem)
  const getSortedItems = useAppStore((s) => s.getSortedItems)
  const saveSelectedItem = useAppStore((s) => s.saveSelectedItem)
  const toggleLockSelectedItem = useAppStore((s) => s.toggleLockSelectedItem)
  const addComment = useAppStore((s) => s.addComment)

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.id, d])),
    [domains],
  )
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const sorted = getSortedItems()

  const filtered = useMemo(() => {
    const domainLabel = (id: string) => domainMap.get(id)?.name || id || "-"
    return sorted.filter((item) => {
      return (
        itemMatchesSearch(item, itemsQuery, domainLabel) &&
        (!typeFilter || item.type === typeFilter) &&
        (!domainFilter || item.domain === domainFilter) &&
        (!statusFilter || item.status === statusFilter) &&
        (!priorityFilter || item.priority === priorityFilter) &&
        (!dueDateFilter || item.dueDate === dueDateFilter)
      )
    })
  }, [
    sorted,
    itemsQuery,
    typeFilter,
    domainFilter,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    domainMap,
  ])

  useEffect(() => {
    if (!filtered.length) {
      if (selectedItemId !== null) selectItem(null)
      return
    }
    if (!filtered.some((item) => item.id === selectedItemId)) {
      selectItem(filtered[0]?.id ?? null)
    }
  }, [filtered, selectedItemId, selectItem])

  const item = allItems.find((i) => i.id === selectedItemId)
  const selected = item ?? undefined

  const locked = selected
    ? selected.status === "확정" || selected.isLocked
    : false

  const detailTitleTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const { register, handleSubmit, control } = useForm<DetailForm>({
    values: selected
      ? {
          title: selected.title,
          domain: selected.domain,
          priority: selected.priority,
          status: selected.status,
          owner: selected.owner,
          dueDate: selected.dueDate,
          description: selected.description,
          clientResponse: selected.clientResponse,
          finalConfirmedValue: selected.finalConfirmedValue,
        }
      : {
          title: "",
          domain: walkDomainsFlat(domains)[0]?.id ?? "",
          priority: "P1",
          status: "논의",
          owner: "",
          dueDate: "",
          description: "",
          clientResponse: "",
          finalConfirmedValue: "",
        },
  })

  const ownerWatched = useWatch({ control, name: "owner" })
  const titleWatched = useWatch({ control, name: "title" })
  const commentAuthor = ownerWatched?.trim() || "틴토랩 PM"

  const syncDetailTitleHeight = () => {
    const el = detailTitleTextareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  useLayoutEffect(() => {
    syncDetailTitleHeight()
  }, [selected?.id, titleWatched])

  const {
    ref: detailTitleFieldRef,
    ...detailTitleFieldRest
  } = register("title")

  const handleDetailTitleRef = (el: HTMLTextAreaElement | null) => {
    detailTitleTextareaRef.current = el
    detailTitleFieldRef(el)
  }

  const handleDetailTitleInput = () => {
    syncDetailTitleHeight()
  }

  const onSave = handleSubmit((data) => {
    saveSelectedItem({
      title: data.title,
      domain: data.domain,
      priority: data.priority,
      status: data.status,
      owner: data.owner,
      dueDate: data.dueDate,
      description: data.description,
      clientResponse: data.clientResponse,
      finalConfirmedValue: data.finalConfirmedValue,
    })
  })

  const itemComments = selected
    ? comments
        .filter((c) => c.itemId === selected.id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
    : []

  const itemHistory = selected
    ? history
        .filter((h) => h.itemId === selected.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
    : []

  const statusOptions = getStatusOptionsForItem(selected)

  return (
    <section className="items-layout" aria-label="아이템 목록 및 상세">
      <Card variant="panel" className="list-panel">
        <div className="panel-head">
          <Heading as="h3" variant="panel">
            Item 목록
          </Heading>
        </div>

        <ItemsFiltersRow domains={domains} />

        <div className="item-list">
          {filtered.map((row) => (
            <Card
              key={row.id}
              variant="compact"
              role="button"
              tabIndex={0}
              className={clsx(
                listItemCardInteractiveClass,
                row.id === selectedItemId &&
                  "border-primary shadow-[0_0_0_3px_rgba(31,94,255,0.08)]",
              )}
              onClick={() => selectItem(row.id)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return
                e.preventDefault()
                selectItem(row.id)
              }}
              aria-current={row.id === selectedItemId ? "true" : undefined}
              aria-label={`${row.code} ${row.title}`}
            >
              <div className="list-top">
                <div className="list-main">
                  <div className="list-code">{row.code}</div>
                  <Text as="div" variant="listTitle">
                    {row.title}
                  </Text>
                  <Text as="div" variant="listDescription">
                    {row.description}
                  </Text>
                </div>
                <span
                  className={clsx(
                    "pill",
                    row.priority === "P0"
                      ? "danger"
                      : row.priority === "P1"
                        ? "warn"
                        : "dark",
                  )}
                >
                  {row.priority}
                </span>
              </div>
              <div className="list-meta">
                <span className="pill dark">{TYPE_LABELS[row.type]}</span>
                <span className="pill primary">
                  {getDomainLabel(row.domain)}
                </span>
                <span
                  className={clsx(
                    "pill",
                    STATUS_STYLE[row.status] || "dark",
                  )}
                >
                  {STATUS_LABELS[row.status]}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card variant="panel" className="detail-panel">
        <div className="panel-head">
          <Heading as="h3" variant="panel">
            Item 상세
          </Heading>
        </div>

        {!selected ? (
          <Text as="div" variant="emptyDetail">
            왼쪽 목록에서 항목을 선택해 주세요.
          </Text>
        ) : (
          <form className="detail-wrap" onSubmit={onSave}>
            <div className="detail-header">
              <div>
                <Text as="div" variant="detailCode">
                  {selected.code}
                </Text>
                <textarea
                  className="detail-title-input"
                  rows={2}
                  disabled={locked}
                  aria-label="제목"
                  {...detailTitleFieldRest}
                  ref={handleDetailTitleRef}
                  onInput={handleDetailTitleInput}
                />
              </div>
              <div className="detail-pills">
                <span
                  className={clsx(
                    "pill",
                    selected.priority === "P0"
                      ? "danger"
                      : selected.priority === "P1"
                        ? "warn"
                        : "dark",
                  )}
                >
                  {selected.priority}
                </span>
                <span className="pill primary">
                  {getDomainLabel(selected.domain)}
                </span>
                <span
                  className={clsx(
                    "pill",
                    STATUS_STYLE[selected.status] || "dark",
                  )}
                >
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <FormLabel htmlFor="detail-type">유형</FormLabel>
                <input
                  id="detail-type"
                  className="input"
                  disabled
                  value={TYPE_LABELS[selected.type]}
                  readOnly
                />
              </div>
              <div>
                <FormLabel htmlFor="detail-domain">도메인</FormLabel>
                <select
                  id="detail-domain"
                  className="input"
                  disabled={locked}
                  {...register("domain")}
                >
                  {walkDomainsFlat(domains).map((d) => (
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
                  className="input"
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
                  className="input"
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
                <input
                  id="detail-owner"
                  className="input"
                  disabled={locked}
                  {...register("owner")}
                />
              </div>
              <div>
                <FormLabel htmlFor="detail-due">마감일</FormLabel>
                <input
                  id="detail-due"
                  className="input"
                  type="date"
                  disabled={locked}
                  {...register("dueDate")}
                />
              </div>
            </div>

            <div className="form-section">
              <FormLabel htmlFor="detail-desc">설명</FormLabel>
              <textarea
                id="detail-desc"
                className="textarea"
                rows={3}
                disabled={locked}
                {...register("description")}
              />
            </div>

            <div className="detail-split">
              <div className="form-section">
                <FormLabel htmlFor="detail-client">고객 회신값</FormLabel>
                <textarea
                  id="detail-client"
                  className="textarea"
                  rows={6}
                  disabled={locked}
                  {...register("clientResponse")}
                />
              </div>
              <div className="form-section">
                <FormLabel htmlFor="detail-final">최종 확인값</FormLabel>
                <textarea
                  id="detail-final"
                  className="textarea"
                  rows={6}
                  disabled={locked}
                  {...register("finalConfirmedValue")}
                />
              </div>
            </div>

            <div className="detail-actions">
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

            <div className="detail-split">
              <Card variant="subpanel">
                <Text as="div" variant="subpanelHead">
                  코멘트
                </Text>
                <CommentSection
                  key={selected.id}
                  defaultAuthor={commentAuthor}
                  addComment={addComment}
                />
                <div className="comments-list">
                  {itemComments.map((c) => (
                    <div key={c.id} className="comment-row">
                      <Text as="div" variant="commentAuthor">
                        {c.author}
                      </Text>
                      <Text as="div" variant="commentMeta">
                        {formatDateTime(c.createdAt)}
                      </Text>
                      <Text as="div" variant="body">
                        {c.body}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
              <Card variant="subpanel">
                <Text as="div" variant="subpanelHead">
                  변경 이력
                </Text>
                <div className="history-list">
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
        )}
      </Card>
    </section>
  )
}

const CommentSection = ({
  defaultAuthor,
  addComment,
}: {
  defaultAuthor: string
  addComment: (author: string, body: string) => boolean
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { author: defaultAuthor || "틴토랩 PM", body: "" },
  })

  const onAdd = handleSubmit((data) => {
    if (addComment(data.author, data.body)) {
      reset({ author: data.author, body: "" })
    }
  })

  return (
    <div className="comment-compose">
      <input
        className="input"
        placeholder="작성자"
        aria-label="코멘트 작성자"
        {...register("author")}
      />
      <textarea
        className="textarea"
        rows={3}
        placeholder="질문, 보완 요청, 회의 메모를 입력하세요."
        aria-label="코멘트 내용"
        {...register("body")}
      />
      <Button
        type="button"
        appearance="outline"
        dimension="hug"
        onClick={onAdd}
      >
        코멘트 추가
      </Button>
    </div>
  )
}
