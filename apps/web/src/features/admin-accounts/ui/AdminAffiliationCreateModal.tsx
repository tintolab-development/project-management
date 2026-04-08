import * as Dialog from "@radix-ui/react-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  AppModalActions,
  AppModalBody,
  AppModalField,
  appModalStyles,
} from "@/shared/ui/app-modal"
import {
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/shared/ui/modal-dialog-buttons"
import {
  FormLabel,
  Heading,
  Text,
  modalCloseIconClassName,
} from "@/shared/ui/typography"

import { useCreateAdminAffiliationMutation } from "../api/useCreateAdminAffiliationMutation"
import {
  adminAffiliationCreateFormSchema,
  type AdminAffiliationCreateFormValues,
} from "../model/adminAffiliationCreateBodySchema"

import styles from "./AdminAffiliationCreateModal.module.css"

const emptyDefaults: AdminAffiliationCreateFormValues = {
  name: "",
}

export type AdminAffiliationCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AdminAffiliationCreateModal = ({
  open,
  onOpenChange,
}: AdminAffiliationCreateModalProps) => {
  const titleId = useId()
  const nameFieldId = useId()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useCreateAdminAffiliationMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminAffiliationCreateFormValues>({
    resolver: zodResolver(adminAffiliationCreateFormSchema),
    defaultValues: emptyDefaults,
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      reset(emptyDefaults)
      setSubmitError(null)
    }
  }

  const onValidSubmit = async (values: AdminAffiliationCreateFormValues) => {
    setSubmitError(null)
    try {
      await createMutation.mutateAsync({ name: values.name })
      handleOpenChange(false)
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "저장에 실패했습니다.",
      )
    }
  }

  const isBusy = createMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn("modal", "admin-affiliation-create-modal")}
          aria-labelledby={titleId}
          aria-describedby={undefined}
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading as="h3" variant="modal" id={titleId}>
                소속 생성
              </Heading>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className={modalCloseIconClassName}
                aria-label="닫기"
                disabled={isBusy}
              >
                ×
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onValidSubmit)} noValidate>
            <AppModalBody>
              <AppModalField>
                <FormLabel htmlFor={nameFieldId}>소속명</FormLabel>
                <Input
                  id={nameFieldId}
                  type="text"
                  autoComplete="organization"
                  placeholder="소속명을 입력하세요"
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? `${nameFieldId}-error` : undefined
                  }
                  className={cn(
                    appModalStyles.singleLineField,
                    styles.modalCompactInput,
                  )}
                  {...register("name", {
                    onChange: () => {
                      setSubmitError(null)
                    },
                  })}
                />
                {errors.name?.message ? (
                  <Text
                    as="p"
                    id={`${nameFieldId}-error`}
                    variant="caption"
                    className={styles.submitError}
                    role="alert"
                  >
                    {errors.name.message}
                  </Text>
                ) : null}
                {submitError && !errors.name?.message ? (
                  <Text
                    as="p"
                    variant="caption"
                    className={styles.submitError}
                    role="alert"
                  >
                    {submitError}
                  </Text>
                ) : null}
              </AppModalField>

              <AppModalActions className={styles.actionsCentered}>
                <Dialog.Close asChild>
                  <ModalSecondaryButton
                    type="button"
                    actionSize="fixedMd"
                    disabled={isBusy}
                  >
                    취소
                  </ModalSecondaryButton>
                </Dialog.Close>
                <ModalPrimaryButton
                  type="submit"
                  actionSize="fixedMd"
                  disabled={isBusy}
                  aria-busy={isBusy}
                >
                  확인
                </ModalPrimaryButton>
              </AppModalActions>
            </AppModalBody>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
