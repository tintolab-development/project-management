import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useId, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import {
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/shared/ui/modal-dialog-buttons"
import { Heading } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"
import { resolveAppDialog, useAppDialogStore } from "@/shared/lib/appDialog"

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
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
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

export const AppDialogHost = () => {
  const active = useAppDialogStore((s) => s.active)
  const open = active !== null
  const titleId = useId()
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
          className={cn(
            "modal",
            "!w-[min(420px,calc(100vw-40px))] max-w-[calc(100vw-40px)]",
          )}
          aria-labelledby={titleId}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            if (active?.kind === "prompt") e.preventDefault()
          }}
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading
                id={titleId}
                as="h3"
                variant="modal"
                className="!text-base"
              >
                {active?.kind === "confirm"
                  ? "확인"
                  : active?.kind === "prompt"
                    ? "입력"
                    : "알림"}
              </Heading>
            </Dialog.Title>
          </div>

          {active ? (
            <div className="flex flex-col gap-4">
              {active.kind === "prompt" ? (
                <PromptPanel
                  key={`${active.message}\u0000${active.defaultValue}`}
                  message={active.message}
                  defaultValue={active.defaultValue}
                  promptInputRef={promptInputRef}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {active.message}
                </p>
              )}
            </div>
          ) : null}

          <div className="modal-actions">
            {active?.kind === "confirm" || active?.kind === "prompt" ? (
              <ModalSecondaryButton
                onClick={() =>
                  resolveAppDialog(active.kind === "confirm" ? false : null)
                }
              >
                취소
              </ModalSecondaryButton>
            ) : null}
            <ModalPrimaryButton
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
              확인
            </ModalPrimaryButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
