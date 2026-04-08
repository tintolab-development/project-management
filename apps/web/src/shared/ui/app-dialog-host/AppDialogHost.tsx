import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useId, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { ModalPrimaryButton, ModalSecondaryButton } from "@/shared/ui/modal-dialog-buttons"
import { Heading } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"
import { resolveAppDialog, useAppDialogStore } from "@/shared/lib/appDialog"

import styles from "./AppDialogHost.module.css"

type PromptPanelProps = {
  message: string
  defaultValue: string
  promptInputRef: React.RefObject<HTMLInputElement | null>
}

const PromptPanel = ({
  message,
  defaultValue,
  promptInputRef,
}: PromptPanelProps) => {
  const [promptValue, setPromptValue] = useState(defaultValue)

  useEffect(() => {
    queueMicrotask(() => promptInputRef.current?.focus())
  }, [promptInputRef])

  const handlePromptSubmit = () => {
    resolveAppDialog(promptValue)
  }

  return (
    <>
      <p className={styles.message}>
        {message}
      </p>
      <Input
        ref={promptInputRef}
        type="text"
        value={promptValue}
        onChange={(e) => setPromptValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return
          e.preventDefault()
          handlePromptSubmit()
        }}
        aria-label={message}
      />
    </>
  )
}

const confirmDialogTitle = (active: {
  kind: "confirm"
  title?: string
  intent: "default" | "destructive"
}) =>
  active.title ??
  (active.intent === "destructive" ? "삭제" : "확인")

const confirmPrimaryLabel = (active: {
  kind: "confirm"
  confirmLabel?: string
  intent: "default" | "destructive"
}) =>
  active.confirmLabel ??
  (active.intent === "destructive" ? "삭제" : "확인")

const cornerQuoteSegment = /(「[^」]+」)/g

/** 「…」로 감싼 동적 문구(예: 프로젝트·소속 이름)를 볼드 처리 */
const renderConfirmMessageWithCornerQuotes = (message: string) => {
  const parts = message.split(cornerQuoteSegment)
  return parts.map((part, i) => {
    if (!part) return null
    if (/^「[^」]+」$/.test(part)) {
      return (
        <strong key={i} className={styles.messageEmphasis}>
          {part}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export const AppDialogHost = () => {
  const active = useAppDialogStore((s) => s.active)
  const open = active !== null
  const titleId = useId()
  const descriptionId = useId()
  const promptInputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next && active) {
      if (active.kind === "alert") resolveAppDialog()
      else if (active.kind === "confirm") resolveAppDialog(false)
      else resolveAppDialog(null)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn("modal", styles.dialogNarrow)}
          aria-labelledby={titleId}
          aria-describedby={active?.kind === "prompt" ? undefined : descriptionId}
          onOpenAutoFocus={(e) => {
            if (active?.kind === "prompt") e.preventDefault()
          }}
        >
          <div className={cn("modal-head", styles.head)}>
            <Dialog.Title asChild>
              <Heading
                id={titleId}
                as="h3"
                variant="modal"
                className={cn("!text-[1.0625rem] !font-semibold", styles.title)}
              >
                {active?.kind === "confirm"
                  ? confirmDialogTitle(active)
                  : active?.kind === "prompt"
                    ? "입력"
                    : "알림"}
              </Heading>
            </Dialog.Title>
          </div>

          {active ? (
            <div className={styles.bodyStack}>
              {active.kind === "prompt" ? (
                <PromptPanel
                  key={`${active.message}\u0000${active.defaultValue}`}
                  message={active.message}
                  defaultValue={active.defaultValue}
                  promptInputRef={promptInputRef}
                />
              ) : (
                <Dialog.Description asChild>
                  <p id={descriptionId} className={styles.message}>
                    {active.kind === "confirm"
                      ? renderConfirmMessageWithCornerQuotes(active.message)
                      : active.message}
                  </p>
                </Dialog.Description>
              )}
            </div>
          ) : null}

          <div className={styles.actions}>
            {active?.kind === "confirm" || active?.kind === "prompt" ? (
              <ModalSecondaryButton
                className={styles.actionButton}
                actionSize="hug"
                onClick={() =>
                  resolveAppDialog(active.kind === "confirm" ? false : null)
                }
              >
                취소
              </ModalSecondaryButton>
            ) : null}
            <ModalPrimaryButton
              className={styles.actionButton}
              actionSize="hug"
              onClick={() => {
                if (!active) return
                if (active.kind === "alert") resolveAppDialog()
                else if (active.kind === "confirm") resolveAppDialog(true)
                else if (active.kind === "prompt") {
                  const el = promptInputRef.current
                  resolveAppDialog(el?.value ?? "")
                }
              }}
            >
              {active?.kind === "confirm"
                ? confirmPrimaryLabel(active)
                : "확인"}
            </ModalPrimaryButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
