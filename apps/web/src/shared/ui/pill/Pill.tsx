import * as React from "react"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

export type PillTone = "neutral" | "primary" | "dark" | "danger" | "warn" | "success"

const toneToVariant: Record<
  PillTone,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  neutral: "pillNeutral",
  primary: "pillPrimary",
  dark: "pillDark",
  danger: "pillDanger",
  warn: "pillWarn",
  success: "pillSuccess",
}

export type PillProps = React.ComponentProps<typeof Badge> & {
  tone: PillTone
}

export function Pill({ tone, className, ...props }: PillProps) {
  return (
    <Badge variant={toneToVariant[tone]} className={cn(className)} {...props} />
  )
}
