import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const headingVariants = cva(
  "m-0 scroll-m-20 tracking-tight text-foreground",
  {
    variants: {
      variant: {
        display: "text-3xl font-bold leading-tight",
        panel: "text-lg font-semibold",
        subpanel: "text-base font-semibold",
        modal: "text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "panel",
    },
  },
)

export type HeadingProps = React.ComponentPropsWithoutRef<"h1"> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4"
  }

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading({ className, variant, as: Comp = "h2", ...props }, ref) {
    return (
      <Comp
        ref={ref as never}
        className={cn(headingVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

export const overlineVariants = cva(
  "text-xs font-bold uppercase tracking-widest",
  {
    variants: {
      tone: {
        default: "text-primary",
        sidebar: "text-[var(--sidebar-section-title)]",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
)

export type OverlineProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof overlineVariants>

export const Overline = forwardRef<HTMLSpanElement, OverlineProps>(
  function Overline({ className, tone, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(overlineVariants({ tone }), className)}
        {...props}
      />
    )
  },
)

export const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-base leading-7 text-foreground",
      muted: "text-sm leading-relaxed text-muted-foreground",
      small: "text-sm text-foreground",
      caption: "text-xs text-muted-foreground",
      lead: "text-base leading-relaxed text-muted-foreground",
      formLabel: "mb-2 block text-sm text-muted-foreground",
      cardTitle: "mb-1.5 font-bold text-card-foreground",
      cardDescription: "text-[13px] leading-[1.55] text-muted-foreground",
      detailCode:
        "mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground",
      listTitle: "mb-1.5 font-bold text-foreground",
      listDescription: "text-[13px] leading-[1.55] text-muted-foreground",
      treeCode: "whitespace-nowrap text-xs text-muted-foreground",
      treeTitle:
        "min-w-0 max-w-full whitespace-normal leading-[1.45] text-foreground",
      treePreviewLabel: "mb-2 text-xs tracking-wide text-muted-foreground",
      treePreviewValue: "leading-[1.7] whitespace-pre-wrap text-foreground",
      treePreviewPlaceholder: "leading-[1.7] whitespace-pre-wrap text-muted-foreground",
      treeEmpty: "px-1 py-3.5 text-muted-foreground",
      treeMasterTitle: "text-sm font-bold text-foreground",
      treeMasterCount: "text-sm text-muted-foreground",
      treeHelpBar:
        "mb-2 border-b border-border px-0.5 pt-0.5 pb-3.5 text-sm text-muted-foreground",
      panelSub: "mt-1.5 text-sm leading-normal text-muted-foreground",
      importHelpTitle: "mb-2 font-bold text-foreground",
      importColumns: "text-sm leading-relaxed text-muted-foreground",
      workspaceMeta: "mb-4 text-muted-foreground",
      boardColumnHead: "font-bold text-foreground",
      statLabel: "mb-2.5 text-[13px] text-muted-foreground",
      statSub: "mt-2 text-xs text-muted-foreground",
      commentAuthor: "mb-1.5 font-bold text-foreground",
      commentMeta: "mb-1.5 text-xs text-muted-foreground",
      emptyDetail: "px-2.5 py-8 text-center text-muted-foreground",
      sidebarBrandName: "text-[15px] font-bold text-[var(--sidebar-text)]",
      sidebarBrandSub: "mt-1 text-xs text-[var(--sidebar-muted)]",
      sidebarNav: "text-[var(--sidebar-nav-link)]",
      sidebarProjectName: "mb-2 font-bold text-[var(--sidebar-text)]",
      sidebarProjectMeta: "text-[13px] leading-normal text-[var(--sidebar-muted)]",
      sidebarFooter:
        "text-[11px] tracking-widest text-[var(--sidebar-footer-text)] uppercase",
      sidebarList:
        "m-0 list-disc space-y-0 pl-[18px] text-sm leading-[1.8] text-[var(--sidebar-principles)]",
      treeDomainButton:
        "min-w-0 text-left font-bold text-foreground",
      subpanelHead: "mb-3 font-bold text-foreground",
      /** Replaces <strong> for inline or block emphasis. */
      emphasis: "font-semibold text-foreground",
      /** shadcn-style card slot title (medium weight, heading font). */
      cardSlotTitle:
        "font-heading text-base font-medium leading-snug text-card-foreground",
      /** CardDescription slot: compact muted line. */
      cardSlotDescription: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

export type TextProps = VariantProps<typeof textVariants> &
  Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
    as?: React.ElementType
  }

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { className, variant, as: Comp = "p", ...props },
  ref,
) {
  return (
    <Comp
      ref={ref}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  )
})

export type FormLabelProps = React.ComponentPropsWithoutRef<"label">

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel({ className, ...props }, ref) {
    return (
      <label
        ref={ref}
        className={cn(textVariants({ variant: "formLabel" }), className)}
        {...props}
      />
    )
  },
)

export type StatValueProps = React.ComponentPropsWithoutRef<"div">

export function StatValue({ className, ...props }: StatValueProps) {
  return (
    <div
      className={cn(
        "text-[28px] font-bold tracking-tight text-card-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export type StatLabelProps = React.ComponentPropsWithoutRef<"div">

export function StatLabel({ className, ...props }: StatLabelProps) {
  return (
    <div
      className={cn(textVariants({ variant: "statLabel" }), className)}
      {...props}
    />
  )
}

export type StatSubProps = React.ComponentPropsWithoutRef<"div">

export function StatSub({ className, ...props }: StatSubProps) {
  return (
    <div
      className={cn(textVariants({ variant: "statSub" }), className)}
      {...props}
    />
  )
}

/** Shared class for modal close icon buttons (×). */
export const modalCloseIconClassName =
  "border-none bg-transparent text-[28px] leading-none font-light"
