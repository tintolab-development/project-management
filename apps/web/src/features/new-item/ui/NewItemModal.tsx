import * as Dialog from "@radix-ui/react-dialog"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useProjectScopedPaths } from "@/shared/lib/projectScopedPaths"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Input, inputControlClassName } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formStackStyles } from "@/shared/ui/form-stack"
import { ModalPrimaryButton } from "@/shared/ui/modal-dialog-buttons"
import {
  FormLabel,
  Heading,
  modalCloseIconClassName,
} from "@/shared/ui/typography"
import { useAppStore } from "@/app/store/useAppStore"
import { appAlert } from "@/shared/lib/appDialog"
import { PRIORITY_LABELS, TYPE_LABELS } from "@/shared/constants/labels"
import type { ItemType } from "@/entities/item/model/types"
import type { Item } from "@/entities/item/model/types"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewItemModal = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()
  const domains = useAppStore((s) => s.domains)
  const createItem = useAppStore((s) => s.createItem)

  const defaultDomain = walkDomainsFlatForClassificationSelect(domains)[0]?.id ?? ""

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
      setDomain(walkDomainsFlatForClassificationSelect(domains)[0]?.id ?? "")
      setPriority("P1")
      setOwner("")
      setDueDate("")
      setTitle("")
      setDescription("")
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      await appAlert("제목을 입력해 주세요.")
      return
    }
    await createItem({
      type,
      domain,
      priority,
      owner,
      dueDate,
      title,
      description,
    })
    handleOpenChange(false)
    navigate(paths.tasks)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal" aria-describedby={undefined}>
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading as="h3" variant="modal">
                새 항목 만들기
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

          <div className={formStackStyles.formGrid}>
            <div>
              <FormLabel htmlFor="new-type">유형</FormLabel>
              <select
                id="new-type"
                className={clsx(inputControlClassName)}
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
              <FormLabel htmlFor="new-domain">도메인</FormLabel>
              <select
                id="new-domain"
                className={clsx(inputControlClassName)}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {walkDomainsFlatForClassificationSelect(domains).map((d) => (
                  <option key={d.id} value={d.id}>
                    {getDomainOptionLabel(domains, d.id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormLabel htmlFor="new-priority">우선순위</FormLabel>
              <select
                id="new-priority"
                className={clsx(inputControlClassName)}
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
              <FormLabel htmlFor="new-owner">담당자</FormLabel>
              <Input
                id="new-owner"
                placeholder="예: 고객사 운영팀"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div>
              <FormLabel htmlFor="new-due">마감일</FormLabel>
              <Input
                id="new-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={formStackStyles.formSection}>
            <FormLabel htmlFor="new-title">제목</FormLabel>
            <Input
              id="new-title"
              placeholder="예: PMS 책임경계 확정"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={formStackStyles.formSection}>
            <FormLabel htmlFor="new-desc">설명</FormLabel>
            <Textarea
              id="new-desc"
              rows={3}
              placeholder="무엇을 확인/결정해야 하는지 적어 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <ModalPrimaryButton onClick={handleSubmit}>생성</ModalPrimaryButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
