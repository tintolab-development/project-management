"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useId, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { FilterDateField } from "@/shared/ui/filter-field"

import { useCreateAdminProjectMutation } from "../api/useAdminProjectsQueries"
import {
  adminProjectCreateFormSchema,
  type AdminProjectCreateFormValues,
} from "../model/adminProjectCreateFormSchema"
import { ADMIN_PROJECT_PLATFORM_OPTIONS } from "../lib/adminProjectPlatformOptions"

import { AdminParticipantSearchInline } from "./AdminParticipantSearchInline"

import styles from "./AdminProjectCreateSheet.module.css"

const emptyDefaults: AdminProjectCreateFormValues = {
  name: "",
  description: "",
  status: "upcoming",
  projectType: "internal",
  platformTags: [],
  startDate: "",
  endDate: "",
  participantNames: [],
}

export type AdminProjectCreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AdminProjectCreateSheet = ({
  open,
  onOpenChange,
}: AdminProjectCreateSheetProps) => {
  const nameId = useId()
  const projectSelectId = useId()
  const startId = useId()
  const endId = useId()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [participantPanelKey, setParticipantPanelKey] = useState(0)
  const [drawerPortalContainer, setDrawerPortalContainer] =
    useState<HTMLDivElement | null>(null)

  const createMutation = useCreateAdminProjectMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AdminProjectCreateFormValues>({
    resolver: zodResolver(adminProjectCreateFormSchema),
    defaultValues: emptyDefaults,
  })

  const participantNames =
    useWatch({
      control,
      name: "participantNames",
      defaultValue: emptyDefaults.participantNames,
    }) ?? emptyDefaults.participantNames
  const platformTags =
    useWatch({
      control,
      name: "platformTags",
      defaultValue: emptyDefaults.platformTags,
    }) ?? emptyDefaults.platformTags

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setParticipantPanelKey((k) => k + 1)
      setSubmitError(null)
    } else {
      reset(emptyDefaults)
      setSubmitError(null)
    }
    onOpenChange(next)
  }

  const handleAddParticipant = (name: string) => {
    const current = getValues("participantNames") ?? []
    if (current.includes(name)) return
    setValue("participantNames", [...current, name], {
      shouldValidate: true,
    })
  }

  const handleRemoveParticipant = (name: string) => {
    const current = getValues("participantNames") ?? []
    setValue(
      "participantNames",
      current.filter((n) => n !== name),
      { shouldValidate: true },
    )
  }

  const onValidSubmit = async (values: AdminProjectCreateFormValues) => {
    setSubmitError(null)
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description,
        status: values.status,
        projectType: values.projectType,
        platformTags: values.platformTags,
        startDate: values.startDate,
        endDate: values.endDate,
        participantNames: values.participantNames,
      })
      handleOpenChange(false)
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "저장에 실패했습니다.",
      )
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent
        ref={setDrawerPortalContainer}
        showCloseButton
        className={cn(
          "flex left-auto mt-0 h-full max-h-[100dvh] min-h-0 w-full max-w-[min(90vw,100%)] flex-col gap-[32px] rounded-none border-l border-border p-0 sm:w-[35vw] sm:max-w-[35vw]",
          "inset-y-0 top-0 right-0",
        )}
      >
        <DrawerHeader className={styles.header}>
          <DrawerTitle className={styles.drawerTitle}>프로젝트 생성</DrawerTitle>
          <DrawerDescription className="sr-only">
            새 프로젝트를 등록합니다.
          </DrawerDescription>
        </DrawerHeader>

        <form
          className={styles.sheetBody}
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
        >
          <div className={styles.scroll} role="region" aria-label="프로젝트 생성 폼">
            <div className={styles.field}>
              <label htmlFor={nameId} className={styles.label}>
                프로젝트명
                <span className={styles.required}>*</span>
              </label>
              <Input
                id={nameId}
                type="text"
                autoComplete="off"
                placeholder="프로젝트명을 입력하세요"
                aria-invalid={Boolean(errors.name)}
                className={styles.textInput}
                {...register("name")}
              />
              {errors.name?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                기간
                <span className={styles.required}>*</span>
              </p>
              <div className={styles.dateRow}>
                <div className={styles.dateField}>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <FilterDateField
                        label="시작일"
                        placeholder="시작일 선택"
                        controlId={startId}
                        value={field.value}
                        onValueChange={field.onChange}
                        fullWidth
                        labelClassName="sr-only"
                        portalContainer={drawerPortalContainer}
                      />
                    )}
                  />
                </div>
                <span className={styles.dateTilde}>~</span>
                <div className={styles.dateField}>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                      <FilterDateField
                        label="종료일"
                        placeholder="종료일 선택"
                        controlId={endId}
                        value={field.value}
                        onValueChange={field.onChange}
                        fullWidth
                        labelClassName="sr-only"
                        portalContainer={drawerPortalContainer}
                      />
                    )}
                  />
                </div>
              </div>
              {errors.startDate?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.startDate.message}
                </p>
              ) : null}
              {errors.endDate?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.endDate.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                유형
                <span className={styles.required}>*</span>
              </p>
              <div className={styles.platformGrid} role="group" aria-label="유형 선택">
                {ADMIN_PROJECT_PLATFORM_OPTIONS.map((opt) => {
                  const isSelected = platformTags.includes(opt.value)
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      appearance={isSelected ? "fill" : "outline"}
                      dimension="hug"
                      className={isSelected ? styles.typeChipActive : styles.typeChip}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (platformTags.includes(opt.value)) {
                          setValue(
                            "platformTags",
                            platformTags.filter((tag) => tag !== opt.value),
                            { shouldValidate: true },
                          )
                          return
                        }
                        setValue("platformTags", [...platformTags, opt.value], {
                          shouldValidate: true,
                        })
                      }}
                    >
                      {opt.label}
                    </Button>
                  )
                })}
              </div>
              {errors.platformTags?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.platformTags.message}
                </p>
              ) : null}
            </div>

            <AdminParticipantSearchInline
              key={participantPanelKey}
              selectedNames={participantNames}
              onAdd={handleAddParticipant}
              onRemove={handleRemoveParticipant}
            />

            <div className={styles.field}>
              <label htmlFor={projectSelectId} className={styles.label}>
                프로젝트 선택
              </label>
              <Textarea
                id={projectSelectId}
                className={styles.projectSelectInput}
                placeholder="프로젝트 설명을 입력하세요 (선택)"
                fieldSize="md"
                fieldWidth="full"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              {errors.description?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.description.message}
                </p>
              ) : null}
            </div>
          </div>

          <DrawerFooter className={styles.footer}>
            {submitError ? (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
            ) : null}
            <Button
              type="button"
              appearance="outline"
              dimension="stretchMd"
              className={styles.footerBtn}
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              appearance="fill"
              dimension="stretchMd"
              className={styles.footerBtn}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "저장 중…" : "확인"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
