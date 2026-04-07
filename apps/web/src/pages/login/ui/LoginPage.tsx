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

/** MSW `mockUsersStore` 시드와 동일 — 개발 모드 빠른 입력 전용 */
const TINTOLAB_ADMIN_EMAIL = "admin@tinto.co.kr"
const TINTOLAB_ADMIN_PASSWORD = "!Tinto0527"
const TINTOLAB_MASTER_PM_EMAIL = "master-pm@tinto.co.kr"
const TINTOLAB_MASTER_PM_PASSWORD = "MasterPm2026!"
const TINTOLAB_PM_EMAIL = "pm@tinto.co.kr"
const TINTOLAB_PM_PASSWORD = "PmTinto2026!"
const SEOHAEWON_STAFF_EMAIL = "staff@seohaewon.co.kr"
const SEOHAEWON_STAFF_PASSWORD = "SeohaeStaff2026!"

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
                className={styles.fieldInput}
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
                className={styles.fieldInput}
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
            {import.meta.env.DEV ? (
              <div className={styles.quickLoginRow}>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="stretchSm"
                  className={styles.quickLoginButton}
                  onClick={() => {
                    clearErrors()
                    setValue("email", TINTOLAB_ADMIN_EMAIL, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    setValue("password", TINTOLAB_ADMIN_PASSWORD, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  틴토랩 관리자
                </Button>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="stretchSm"
                  className={styles.quickLoginButton}
                  onClick={() => {
                    clearErrors()
                    setValue("email", TINTOLAB_MASTER_PM_EMAIL, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    setValue("password", TINTOLAB_MASTER_PM_PASSWORD, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  틴토랩 마스터 PM
                </Button>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="stretchSm"
                  className={styles.quickLoginButton}
                  onClick={() => {
                    clearErrors()
                    setValue("email", TINTOLAB_PM_EMAIL, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    setValue("password", TINTOLAB_PM_PASSWORD, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  틴토랩 PM (알파·베타)
                </Button>
                <Button
                  type="button"
                  appearance="fill"
                  dimension="stretchSm"
                  className={styles.quickLoginButton}
                  onClick={() => {
                    clearErrors()
                    setValue("email", SEOHAEWON_STAFF_EMAIL, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    setValue("password", SEOHAEWON_STAFF_PASSWORD, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  설해원 담당자
                </Button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
