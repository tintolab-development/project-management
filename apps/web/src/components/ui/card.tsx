import * as React from "react"
import { cva, type VariantProps as CvaVariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Text } from "@/components/ui/typography"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden text-card-foreground *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      variant: {
        default:
          "gap-4 rounded-xl bg-card px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-[var(--pad-widget-y)] data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        panel:
          "gap-0 rounded-lg bg-card px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm shadow-app ring-1 ring-border/60",
        stat:
          "gap-0 rounded-lg bg-card px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm shadow-app ring-1 ring-border/60",
        compact:
          "gap-0 rounded-app-md border border-border bg-background px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm shadow-none ring-0",
        history:
          "gap-0 rounded-r-xl rounded-l-none border-0 border-l-[3px] border-l-[var(--border-history)] bg-surface-subtle px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm shadow-none ring-0",
        subpanel:
          "gap-0 rounded-2xl border border-border bg-surface-subtle px-[var(--pad-widget-x)] py-[var(--pad-widget-y)] text-sm shadow-none ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type CardProps = React.ComponentProps<"div"> &
  CvaVariantProps<typeof cardVariants> & {
    size?: "default" | "sm"
  }

type CardVariantProps = CvaVariantProps<typeof cardVariants>

function Card({ className, variant = "default", size = "default", ...props }: CardProps) {
  const v = variant ?? "default"
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={v}
      className={cn(cardVariants({ variant: v }), className)}
      {...props}
    />
  )
}

/** 루트 카드에 --pad-widget-x 가 있으므로 슬롯 가로 패딩은 중복 방지 */
const cardSlotPxReset = "px-0"

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[variant=default]/card:group-data-[size=sm]/card:[.border-b]:pb-3",
        cardSlotPxReset,
        className,
      )}
      {...props}
    />
  )
}

const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <Text
        ref={ref}
        as="div"
        variant="cardSlotTitle"
        className={cn("group-data-[size=sm]/card:text-sm", className)}
        {...props}
        data-slot="card-title"
      />
    )
  },
)

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function CardDescription({ className, ...props }, ref) {
  return (
    <Text
      ref={ref}
      as="div"
      variant="cardSlotDescription"
      className={className}
      {...props}
      data-slot="card-description"
    />
  )
})

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn(cardSlotPxReset, className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-0 py-0 group-data-[variant=default]/card:border-t group-data-[variant=default]/card:bg-muted/50 group-data-[variant=default]/card:px-0 group-data-[variant=default]/card:py-[var(--space-4)] group-data-[variant=default]/card:group-data-[size=sm]/card:py-[var(--space-3)]",
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
export type { CardProps, CardVariantProps }
