import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"

import {
  loginFormSchema,
  loginRequest,
  resolvePostLoginPath,
  type LoginFormValues,
  useAuthSessionStore,
} from "@/features/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Input } from "@/components/ui/input"
import { FormLabel, Heading, Text } from "@/shared/ui/typography"

import styles from "./LoginPage.module.css"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

/** MSW `mockUsersStore` 시드와 동일 — 로그인 폼 빠른 입력 */
const TINTOLAB_MASTER_ADMIN_EMAIL = "master-pm@tinto.co.kr"
const TINTOLAB_MASTER_ADMIN_PASSWORD = "MasterPm2026!"
const PROJECT_PM_EMAIL = "pm@project.com"
const PROJECT_PM_PASSWORD = "ProjectPm2026!"
const MULTI_SAMPLE_EMAIL = "multi@demo.local"
const MULTI_SAMPLE_PASSWORD = "MultiDemo2026!"

export const LoginPage = () => {
  const navigate = useNavigate()
  const accessToken = useAuthSessionStore((s) => s.accessToken)
  const sessionUser = useAuthSessionStore((s) => s.user)
  const setSession = useAuthSessionStore((s) => s.setSession)

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  if (!authBypassed && accessToken && sessionUser) {
    return <Navigate to={resolvePostLoginPath(sessionUser)} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await loginRequest(values)
      setSession({ accessToken: res.accessToken, user: res.user })
      navigate(resolvePostLoginPath(res.user), { replace: true })
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "로그인에 실패했습니다.",
      })
    }
  })

  return (
    <div className={styles.page}>
      <Card variant="panel" className={styles.widget}>
        <CardHeader className={styles.header}>
          <Heading as="h1" variant="loginHero">
            로그인
          </Heading>
        </CardHeader>
        <CardContent className={cn(styles.content, "px-0")}>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <FormLabel htmlFor="login-email">이메일</FormLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="이메일을 입력하세요"
                aria-invalid={Boolean(errors.email)}
                className={cn(styles.fieldInput, "focus-visible:ring-0")}
                {...register("email")}
              />
              {errors.email ? (
                <Text as="p" variant="caption" className={styles.fieldError}>
                  {errors.email.message}
                </Text>
              ) : null}
            </div>
            <div className={styles.field}>
              <FormLabel htmlFor="login-password">PW</FormLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="패스워드를 입력하세요"
                aria-invalid={Boolean(errors.password)}
                className={cn(styles.fieldInput, "focus-visible:ring-0")}
                {...register("password")}
              />
              {errors.password ? (
                <Text as="p" variant="caption" className={styles.fieldError}>
                  {errors.password.message}
                </Text>
              ) : null}
            </div>
            {errors.root ? (
              <p className={styles.rootError}>{errors.root.message}</p>
            ) : null}
            <Button
              type="submit"
              appearance="fill"
              dimension="stretchMd"
              className={styles.submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "로그인 중…" : "로그인"}
            </Button>
            <div className={styles.quickLoginRow}>
              <Button
                type="button"
                appearance="fill"
                dimension="stretchSm"
                className={styles.quickLoginButton}
                onClick={() => {
                  clearErrors()
                  setValue("email", TINTOLAB_MASTER_ADMIN_EMAIL, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setValue("password", TINTOLAB_MASTER_ADMIN_PASSWORD, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                틴토랩 마스터 관리자
              </Button>
              <Button
                type="button"
                appearance="fill"
                dimension="stretchSm"
                className={styles.quickLoginButton}
                onClick={() => {
                  clearErrors()
                  setValue("email", PROJECT_PM_EMAIL, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setValue("password", PROJECT_PM_PASSWORD, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                프로젝트 담당자
              </Button>
              <Button
                type="button"
                appearance="fill"
                dimension="stretchSm"
                className={styles.quickLoginButton}
                onClick={() => {
                  clearErrors()
                  setValue("email", MULTI_SAMPLE_EMAIL, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setValue("password", MULTI_SAMPLE_PASSWORD, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                샘플 멀티 프로젝트
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
