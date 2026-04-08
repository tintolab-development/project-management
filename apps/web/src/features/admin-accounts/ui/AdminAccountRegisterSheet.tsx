"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/shared/ui/button"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormLabel } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

import { useCheckAdminLoginIdAvailabilityMutation } from "../api/useCheckAdminLoginIdAvailabilityMutation"
import { useCreateAdminAccountMemberMutation } from "../api/useCreateAdminAccountMemberMutation"
import {
  adminAccountRegisterFormSchema,
  type AdminAccountRegisterFormValues,
} from "../model/adminAccountRegisterFormSchema"

import styles from "./AdminAccountRegisterSheet.module.css"

const defaultFormValues: AdminAccountRegisterFormValues = {
  loginId: "",
  password: "",
  permission: "뷰어",
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
}

export type AdminAccountRegisterSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
}

export const AdminAccountRegisterSheet = ({
  open,
  onOpenChange,
  projectId,
}: AdminAccountRegisterSheetProps) => {
  const loginIdFieldId = useId()
  const passwordId = useId()
  const permissionId = useId()
  const nameId = useId()
  const jobTitleId = useId()
  const emailId = useId()
  const phoneId = useId()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [verifiedLoginId, setVerifiedLoginId] = useState<string | null>(null)
  const verifiedLoginIdRef = useRef<string | null>(null)
  const [dupHint, setDupHint] = useState<{
    tone: "ok" | "bad"
    text: string
  } | null>(null)

  const checkMutation = useCheckAdminLoginIdAvailabilityMutation()
  const createMutation = useCreateAdminAccountMemberMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AdminAccountRegisterFormValues>({
    resolver: zodResolver(adminAccountRegisterFormSchema),
    defaultValues: defaultFormValues,
  })

  /* eslint-disable react-hooks/set-state-in-effect -- controlled drawer가 열릴 때 폼·로컬 상태 초기화 */
  useEffect(() => {
    if (!open) return
    reset(defaultFormValues)
    setSubmitError(null)
    setVerifiedLoginId(null)
    verifiedLoginIdRef.current = null
    setDupHint(null)
  }, [open, reset])
  /* eslint-enable react-hooks/set-state-in-effect */

  const permissionSelectItems = useMemo(
    () =>
      ({
        뷰어: "일반",
        편집자: "편집자",
        관리자: "관리자",
      }) as Record<string, ReactNode>,
    [],
  )

  const handleDuplicateCheck = useCallback(async () => {
    setSubmitError(null)
    const trimmed = getValues("loginId").trim()
    if (!trimmed) {
      setDupHint({ tone: "bad", text: "아이디를 입력하세요" })
      verifiedLoginIdRef.current = null
      setVerifiedLoginId(null)
      return
    }
    try {
      const { available } = await checkMutation.mutateAsync({ loginId: trimmed })
      if (available) {
        verifiedLoginIdRef.current = trimmed
        setVerifiedLoginId(trimmed)
        setDupHint({ tone: "ok", text: "사용 가능한 아이디입니다." })
      } else {
        verifiedLoginIdRef.current = null
        setVerifiedLoginId(null)
        setDupHint({ tone: "bad", text: "이미 사용 중인 아이디입니다." })
      }
    } catch (e) {
      verifiedLoginIdRef.current = null
      setVerifiedLoginId(null)
      setDupHint({
        tone: "bad",
        text: e instanceof Error ? e.message : "중복확인에 실패했습니다.",
      })
    }
  }, [checkMutation, getValues])

  const onSubmit = (values: AdminAccountRegisterFormValues) => {
    setSubmitError(null)
    const trimmedId = values.loginId.trim()
    if (trimmedId !== verifiedLoginId) {
      setSubmitError("아이디 중복확인을 완료해 주세요")
      return
    }
    if (!projectId) {
      setSubmitError("소속 정보가 없습니다.")
      return
    }
    createMutation.mutate(
      {
        projectId,
        loginId: trimmedId,
        password: values.password,
        permission: values.permission,
        name: values.name.trim(),
        jobTitle: values.jobTitle.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
        onError: (e) => {
          setSubmitError(
            e instanceof Error ? e.message : "저장에 실패했습니다.",
          )
        },
      },
    )
  }

  const isBusy = createMutation.isPending || checkMutation.isPending

  const {
    onChange: loginIdOnChange,
    ...loginIdRegister
  } = register("loginId")

  const handleLoginIdChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      loginIdOnChange(e)
      const t = e.target.value.trim()
      const cur = verifiedLoginIdRef.current
      if (cur !== null && t !== cur) {
        verifiedLoginIdRef.current = null
        setVerifiedLoginId(null)
        setDupHint(null)
      }
    },
    [loginIdOnChange],
  )

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent
        showCloseButton
        className={cn(
          "flex left-auto mt-0 h-full max-h-[100dvh] min-h-0 w-full max-w-[min(90vw,100%)] flex-col gap-[32px] rounded-none border-l border-border p-0 sm:w-[35vw] sm:max-w-[35vw]",
          "inset-y-0 top-0 right-0",
        )}
      >
        <DrawerHeader className={styles.header}>
          <DrawerTitle className={styles.drawerTitle}>계정 등록</DrawerTitle>
          <DrawerDescription className="sr-only">
            새 계정을 등록합니다. 필수 항목을 입력한 뒤 아이디 중복확인을 진행하세요.
          </DrawerDescription>
        </DrawerHeader>

        <form
          className={styles.sheetBody}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div
            className={styles.scroll}
            role="region"
            aria-label="계정 등록 폼"
          >
            <div className={styles.field}>
              <FormLabel htmlFor={loginIdFieldId} className={styles.fieldLabel}>
                아이디
                <span className={styles.required} aria-hidden>
                  *
                </span>
              </FormLabel>
              <div className={styles.idRow}>
                <div className={styles.idInputWrap}>
                  <Input
                    id={loginIdFieldId}
                    className={cn(styles.textInput, styles.idRowInput)}
                    placeholder="아이디를 입력하세요"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.loginId)}
                    disabled={isBusy}
                    {...loginIdRegister}
                    onChange={handleLoginIdChange}
                  />
                </div>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="hug"
                  className={styles.duplicateCheckBtn}
                  disabled={isBusy}
                  onClick={handleDuplicateCheck}
                >
                  {checkMutation.isPending ? "확인 중…" : "중복확인"}
                </Button>
              </div>
              {errors.loginId?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.loginId.message}
                </p>
              ) : null}
              {dupHint ? (
                <p
                  className={
                    dupHint.tone === "ok"
                      ? styles.duplicateHintOk
                      : styles.duplicateHintBad
                  }
                  role="status"
                  aria-live="polite"
                >
                  {dupHint.text}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <FormLabel htmlFor={passwordId} className={styles.fieldLabel}>
                비밀번호
                <span className={styles.required} aria-hidden>
                  *
                </span>
              </FormLabel>
              <Input
                id={passwordId}
                type="password"
                className={styles.textInput}
                placeholder="비밀번호를 입력하세요"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                disabled={isBusy}
                {...register("password")}
              />
              {errors.password?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel} id={`${permissionId}-label`}>
                권한
                <span className={styles.required} aria-hidden>
                  *
                </span>
              </span>
              <Controller
                control={control}
                name="permission"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={permissionSelectItems}
                    disabled={isBusy}
                    onValueChange={(v) =>
                      field.onChange(v as AdminAccountRegisterFormValues["permission"])
                    }
                  >
                    <SelectTrigger
                      id={permissionId}
                      className={cn(styles.selectTrigger, styles.textInput)}
                      aria-labelledby={`${permissionId}-label`}
                      aria-invalid={Boolean(errors.permission)}
                    >
                      <SelectValue placeholder="권한을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} portal={false}>
                      <SelectItem value="뷰어">일반</SelectItem>
                      <SelectItem value="편집자">편집자</SelectItem>
                      <SelectItem value="관리자">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.permission?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.permission.message}
                </p>
              ) : null}
            </div>

            <hr className={styles.sectionDivider} aria-hidden />

            <div className={styles.field}>
              <FormLabel htmlFor={nameId} className={styles.fieldLabel}>
                이름
                <span className={styles.required} aria-hidden>
                  *
                </span>
              </FormLabel>
              <Input
                id={nameId}
                className={styles.textInput}
                placeholder="이름을 입력하세요"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                disabled={isBusy}
                {...register("name")}
              />
              {errors.name?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <FormLabel htmlFor={jobTitleId} className={styles.fieldLabel}>
                직무(직급)
                <span className={styles.required} aria-hidden>
                  *
                </span>
              </FormLabel>
              <Input
                id={jobTitleId}
                className={styles.textInput}
                placeholder="직무 또는 직급을 입력하세요"
                autoComplete="organization-title"
                aria-invalid={Boolean(errors.jobTitle)}
                disabled={isBusy}
                {...register("jobTitle")}
              />
              {errors.jobTitle?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.jobTitle.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <FormLabel htmlFor={emailId} className={styles.fieldLabel}>
                이메일
              </FormLabel>
              <Input
                id={emailId}
                type="email"
                className={styles.textInput}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                disabled={isBusy}
                {...register("email")}
              />
              {errors.email?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <FormLabel htmlFor={phoneId} className={styles.fieldLabel}>
                전화번호
              </FormLabel>
              <Input
                id={phoneId}
                className={styles.textInput}
                placeholder="전화번호를 입력하세요"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                disabled={isBusy}
                {...register("phone")}
              />
              {errors.phone?.message ? (
                <p className={styles.errorText} role="alert">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <p className={styles.errorText} role="alert">
                {submitError}
              </p>
            ) : null}
          </div>

          <DrawerFooter className={styles.footer}>
            <Button
              type="button"
              appearance="outline"
              dimension="stretchMd"
              className={styles.footerBtn}
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              appearance="fill"
              dimension="stretchMd"
              className={styles.footerBtn}
              disabled={isBusy}
            >
              {createMutation.isPending ? "저장 중…" : "확인"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
