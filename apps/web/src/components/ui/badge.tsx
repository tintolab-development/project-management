import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge box-border flex h-auto w-fit min-w-0 items-center justify-center gap-[10px] overflow-hidden rounded-4xl border border-transparent px-[10px] py-[4px] text-xs font-medium leading-none whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
        pillNeutral:
          "rounded-full border border-[var(--line-strong)] bg-[var(--panel)] text-app-xs font-medium leading-none shadow-none ring-0",
        pillPrimary:
          "rounded-full border border-[var(--border-pill-primary)] bg-[var(--primary-soft)] text-app-xs font-medium leading-none text-[var(--primary)] shadow-none ring-0",
        pillDark:
          "rounded-full border border-[var(--line-strong)] bg-[var(--surface-pill-neutral)] text-app-xs font-medium leading-none text-[var(--text-pill-dark)] shadow-none ring-0",
        pillDanger:
          "rounded-full border border-[var(--border-pill-danger)] bg-[var(--danger-soft)] text-app-xs font-medium leading-none text-[var(--danger)] shadow-none ring-0",
        pillWarn:
          "rounded-full border border-[var(--border-pill-warn)] bg-[var(--warn-soft)] text-app-xs font-medium leading-none text-[var(--warn)] shadow-none ring-0",
        pillSuccess:
          "rounded-full border border-[var(--border-pill-success)] bg-[var(--success-soft)] text-app-xs font-medium leading-none text-[var(--success)] shadow-none ring-0",
        /** Tasks 목록 카드: 비선택(윤곽) / 선택 행(채움) */
        itemListInactive:
          "rounded-full border border-[var(--item-list-badge-line)] bg-transparent text-app-xs font-normal leading-none text-[var(--item-list-badge-text)] shadow-none ring-0 [font-family:var(--font-item-list-badge)] focus-visible:border-[var(--item-list-badge-line)] focus-visible:ring-[var(--item-list-badge-line)]/20",
        itemListActive:
          "rounded-full border border-[var(--item-list-badge-line)] bg-[var(--item-list-badge-fill)] text-app-xs font-normal leading-none text-[var(--item-list-badge-on-fill)] shadow-none ring-0 [font-family:var(--font-item-list-badge)] focus-visible:border-[var(--item-list-badge-line)] focus-visible:ring-[var(--item-list-badge-line)]/20",
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
