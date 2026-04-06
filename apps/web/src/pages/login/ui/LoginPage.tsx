import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"

import {
  loginFormSchema,
  loginRequest,
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

/** MSW 시드와 동일 — 개발용 자동 입력만 */
const DEV_ADMIN_EMAIL = "admin@tinto.co.kr"
const DEV_ADMIN_PASSWORD = "!Tinto0527"

export const LoginPage = () => {
  const navigate = useNavigate()
  const accessToken = useAuthSessionStore((s) => s.accessToken)
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

  if (!authBypassed && accessToken) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await loginRequest(values)
      setSession({ accessToken: res.accessToken, user: res.user })
      navigate("/", { replace: true })
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
              <FormLabel htmlFor="login-email">Email</FormLabel>
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
            {import.meta.env.DEV ? (
              <Button
                type="button"
                appearance="fill"
                dimension="hug"
                className={styles.devAdminFill}
                onClick={() => {
                  clearErrors()
                  setValue("email", DEV_ADMIN_EMAIL, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  setValue("password", DEV_ADMIN_PASSWORD, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                개발용 관리자 로그인
              </Button>
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
