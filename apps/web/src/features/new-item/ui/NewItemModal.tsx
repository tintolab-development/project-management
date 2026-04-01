import * as Dialog from "@radix-ui/react-dialog"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAppStore } from "@/app/store/useAppStore"
import { PRIORITY_LABELS, TYPE_LABELS } from "@/shared/constants/labels"
import type { ItemType } from "@/entities/item/model/types"
import type { Item } from "@/entities/item/model/types"
import { getDomainOptionLabel, walkDomainsFlat } from "@/entities/domain/lib/domainTree"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewItemModal = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate()
  const domains = useAppStore((s) => s.domains)
  const createItem = useAppStore((s) => s.createItem)

  const defaultDomain = walkDomainsFlat(domains)[0]?.id ?? ""

  const [type, setType] = useState<ItemType>("information_request")
  const [domain, setDomain] = useState(defaultDomain)
  const [priority, setPriority] = useState<Item["priority"]>("P1")
  const [owner, setOwner] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setType("information_request")
      setDomain(walkDomainsFlat(domains)[0]?.id ?? "")
      setPriority("P1")
      setOwner("")
      setDueDate("")
      setTitle("")
      setDescription("")
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      window.alert("제목을 입력해 주세요.")
      return
    }
    createItem({
      type,
      domain,
      priority,
      owner,
      dueDate,
      title,
      description,
    })
    handleOpenChange(false)
    navigate("/items")
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal" aria-describedby={undefined}>
          <div className="modal-head">
            <Dialog.Title asChild>
              <h3>새 항목 만들기</h3>
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="icon-btn"
              aria-label="닫기"
            >
              ×
            </Dialog.Close>
          </div>

          <div className="form-grid">
            <div>
              <label htmlFor="new-type">유형</label>
              <select
                id="new-type"
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as ItemType)}
              >
                {(Object.keys(TYPE_LABELS) as ItemType[]).map((key) => (
                  <option key={key} value={key}>
                    {TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-domain">도메인</label>
              <select
                id="new-domain"
                className="input"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {walkDomainsFlat(domains).map((d) => (
                  <option key={d.id} value={d.id}>
                    {getDomainOptionLabel(domains, d.id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-priority">우선순위</label>
              <select
                id="new-priority"
                className="input"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Item["priority"])
                }
              >
                {(Object.keys(PRIORITY_LABELS) as Item["priority"][]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {PRIORITY_LABELS[key]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label htmlFor="new-owner">담당자</label>
              <input
                id="new-owner"
                className="input"
                placeholder="예: 설해원 운영팀"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-due">마감일</label>
              <input
                id="new-due"
                className="input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="new-title">제목</label>
            <input
              id="new-title"
              className="input"
              placeholder="예: PMS 책임경계 확정"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label htmlFor="new-desc">설명</label>
            <textarea
              id="new-desc"
              className="textarea"
              rows={3}
              placeholder="무엇을 확인/결정해야 하는지 적어 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn primary"
              onClick={handleSubmit}
            >
              생성
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
