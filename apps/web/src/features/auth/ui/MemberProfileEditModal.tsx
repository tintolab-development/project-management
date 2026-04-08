import * as Dialog from "@radix-ui/react-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { useForm } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  FormLabel,
  Heading,
  Text,
  modalCloseIconClassName,
} from "@/shared/ui/typography"

import {
  fetchMemberProfile,
  patchMemberProfile,
} from "../api/memberProfileApi"
import { memberProfileQueryKeys } from "../lib/memberProfileQueryKeys"
import {
  memberProfileFormSchema,
  type MemberProfileFormValues,
} from "../model/memberProfileFormSchema"
import { useAuthSessionStore } from "../model/authSession.store"

import styles from "./MemberProfileEditModal.module.css"

const emptyDefaults: MemberProfileFormValues = {
  displayName: "",
  loginId: "",
  phone: "",
  email: "",
  password: "",
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MemberProfileEditModal = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient()
  const accessToken = useAuthSessionStore((s) => s.accessToken)
  const sessionUser = useAuthSessionStore((s) => s.user)
  const setSession = useAuthSessionStore((s) => s.setSession)

  const userId = sessionUser?.id ?? ""
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const nameId = useId()
  const loginIdFieldId = useId()
  const passwordId = useId()
  const phoneId = useId()
  const emailId = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberProfileFormValues>({
    resolver: zodResolver(memberProfileFormSchema),
    defaultValues: emptyDefaults,
  })

  const {
    data: profileData,
    isPending: isProfilePending,
    isError: isProfileError,
    error: profileError,
    refetch,
  } = useQuery({
    queryKey: memberProfileQueryKeys.detail(userId),
    queryFn: () => fetchMemberProfile(accessToken!),
    enabled: open && Boolean(accessToken) && Boolean(userId),
  })

  useEffect(() => {
    if (!open || !profileData) return
    reset({
      displayName: profileData.displayName,
      loginId: profileData.loginId,
      phone: profileData.phone,
      email: profileData.email,
      password: "",
    })
  }, [open, profileData, reset])

  const mutation = useMutation({
    mutationFn: (values: MemberProfileFormValues) =>
      patchMemberProfile(accessToken!, values),
    onSuccess: (user) => {
      if (!accessToken) return
      setSession({ accessToken, user })
      void queryClient.invalidateQueries({
        queryKey: memberProfileQueryKeys.detail(user.id),
      })
      onOpenChange(false)
    },
    onError: (e) => {
      setSubmitError(
        e instanceof Error ? e.message : "저장에 실패했습니다.",
      )
    },
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) {
      setSubmitError(null)
      return
    }
    reset(emptyDefaults)
    setSubmitError(null)
    setShowPassword(false)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword((v) => !v)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!accessToken) return
    setSubmitError(null)
    try {
      await mutation.mutateAsync(values)
    } catch {
      /* submitError는 mutation.onError에서 설정 */
    }
  })

  const canLoad = Boolean(accessToken) && Boolean(userId)
  const disableForm = isProfilePending || isProfileError || !canLoad

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal member-profile-modal"
          aria-describedby={undefined}
        >
          <div className="modal-head">
            <Dialog.Title asChild>
              <Heading as="h2" variant="modal">
                회원정보 수정
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

          <div className={styles.body} data-slot="member-profile-body">
            {!canLoad ? (
              <Text as="p" variant="caption" className={styles.muted}>
                로그인이 필요합니다.
              </Text>
            ) : null}

            {canLoad && isProfilePending ? (
              <Text as="p" variant="caption" className={styles.muted}>
                불러오는 중…
              </Text>
            ) : null}

            {canLoad && isProfileError ? (
              <div className={styles.field}>
                <Text as="p" variant="caption" className={styles.fieldError}>
                  {profileError instanceof Error
                    ? profileError.message
                    : "프로필을 불러오지 못했습니다."}
                </Text>
                <Button
                  type="button"
                  appearance="outline"
                  dimension="hug"
                  onClick={() => void refetch()}
                >
                  다시 시도
                </Button>
              </div>
            ) : null}

            {canLoad && !isProfilePending && !isProfileError ? (
              <form className={styles.form} onSubmit={onSubmit} noValidate>
                <div className={styles.field}>
                  <FormLabel htmlFor={nameId}>이름</FormLabel>
                  <Input
                    id={nameId}
                    type="text"
                    autoComplete="name"
                    disabled={disableForm}
                    aria-invalid={Boolean(errors.displayName)}
                    className={cn(styles.fieldInput, styles.profileInput)}
                    {...register("displayName")}
                  />
                  {errors.displayName ? (
                    <Text
                      as="p"
                      variant="caption"
                      className={styles.fieldError}
                    >
                      {errors.displayName.message}
                    </Text>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <FormLabel htmlFor={loginIdFieldId}>아이디</FormLabel>
                  <Input
                    id={loginIdFieldId}
                    type="text"
                    autoComplete="username"
                    disabled={disableForm}
                    aria-invalid={Boolean(errors.loginId)}
                    className={cn(styles.fieldInput, styles.profileInput)}
                    {...register("loginId")}
                  />
                  {errors.loginId ? (
                    <Text
                      as="p"
                      variant="caption"
                      className={styles.fieldError}
                    >
                      {errors.loginId.message}
                    </Text>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <FormLabel htmlFor={passwordId}>비밀번호</FormLabel>
                  <div className={styles.passwordShell}>
                    <Input
                      id={passwordId}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="변경하지 않으려면 비워 두세요"
                      disabled={disableForm}
                      aria-invalid={Boolean(errors.password)}
                      className={cn(
                        styles.fieldInput,
                        styles.passwordInnerInput,
                      )}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={handleTogglePasswordVisibility}
                      disabled={disableForm}
                      aria-label={
                        showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={styles.togglePasswordIcon}
                          aria-hidden
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Eye
                          className={styles.togglePasswordIcon}
                          aria-hidden
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <Text
                      as="p"
                      variant="caption"
                      className={styles.fieldError}
                    >
                      {errors.password.message}
                    </Text>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <FormLabel htmlFor={phoneId}>휴대폰번호</FormLabel>
                  <Input
                    id={phoneId}
                    type="tel"
                    autoComplete="tel"
                    disabled={disableForm}
                    aria-invalid={Boolean(errors.phone)}
                    className={cn(styles.fieldInput, styles.profileInput)}
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <Text
                      as="p"
                      variant="caption"
                      className={styles.fieldError}
                    >
                      {errors.phone.message}
                    </Text>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <FormLabel htmlFor={emailId}>이메일</FormLabel>
                  <Input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    disabled={disableForm}
                    aria-invalid={Boolean(errors.email)}
                    className={cn(styles.fieldInput, styles.profileInput)}
                    {...register("email")}
                  />
                  {errors.email ? (
                    <Text
                      as="p"
                      variant="caption"
                      className={styles.fieldError}
                    >
                      {errors.email.message}
                    </Text>
                  ) : null}
                </div>

                {submitError ? (
                  <p className={styles.rootError} role="alert">
                    {submitError}
                  </p>
                ) : null}

                <div className={styles.actions}>
                  <Button
                    type="button"
                    appearance="outline"
                    dimension="stretchMd"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting || mutation.isPending}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    appearance="fill"
                    dimension="stretchMd"
                    disabled={
                      isSubmitting || mutation.isPending || disableForm
                    }
                  >
                    확인
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
