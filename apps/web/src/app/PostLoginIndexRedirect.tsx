import { Navigate } from "react-router-dom"

import { resolvePostLoginPath, useAuthSessionStore } from "@/features/auth"

const authBypassed = import.meta.env.VITE_REQUIRE_AUTH === "false"

export const PostLoginIndexRedirect = () => {
  const accessToken = useAuthSessionStore((s) => s.accessToken)
  const user = useAuthSessionStore((s) => s.user)

  if (authBypassed) {
    return <Navigate to="/project/seohaewon/dashboard" replace />
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={resolvePostLoginPath(user)} replace />
}
