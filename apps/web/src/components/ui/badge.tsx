import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        pillNeutral:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-app-3 py-0 text-app-xs font-medium shadow-none ring-0",
        pillPrimary:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--border-pill-primary)] bg-[var(--primary-soft)] px-app-3 py-0 text-app-xs font-medium text-[var(--primary)] shadow-none ring-0",
        pillDark:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--line-strong)] bg-[var(--surface-pill-neutral)] px-app-3 py-0 text-app-xs font-medium text-[var(--text-pill-dark)] shadow-none ring-0",
        pillDanger:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--border-pill-danger)] bg-[var(--danger-soft)] px-app-3 py-0 text-app-xs font-medium text-[var(--danger)] shadow-none ring-0",
        pillWarn:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--border-pill-warn)] bg-[var(--warn-soft)] px-app-3 py-0 text-app-xs font-medium text-[var(--warn)] shadow-none ring-0",
        pillSuccess:
          "h-auto min-h-7 gap-app-1 rounded-full border border-[var(--border-pill-success)] bg-[var(--success-soft)] px-app-3 py-0 text-app-xs font-medium text-[var(--success)] shadow-none ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
