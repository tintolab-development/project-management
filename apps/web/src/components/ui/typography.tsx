import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const headingVariants = cva(
  "m-0 scroll-m-20 tracking-tight text-foreground",
  {
    variants: {
      variant: {
        display: "text-3xl font-bold leading-tight",
        /**
         * 앱 셸(TopBar) 최상위 페이지 타이틀 — 패널·카드 타이틀(16px대)보다 한 단계 크게
         */
        shellPageTitle:
          "text-4xl font-bold leading-tight tracking-tight text-[#000] [font-style:normal] [font-family:var(--font-login-title)]",
        panel: "text-lg font-semibold",
        subpanel: "text-base font-semibold",
        modal: "text-lg font-semibold",
        /** 로그인 위젯 타이틀: 36px / 700 / 150% / #333 / Pretendard */
        loginHero:
          "text-center font-bold leading-[150%] text-[#333] [font-family:var(--font-login-title)] text-[36px]",
        /** 대시보드 패널 카드 대표 타이틀 (상단 KPI 위젯 라벨과 구분 — 20/700) */
        dashboardSection:
          "text-[20px] font-bold leading-normal tracking-normal text-[#000] [font-style:normal] [font-family:var(--font-login-title)]",
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
        sidebar: "text-[#000] leading-normal",
        /** LNB 섹션 카테고리 (프로젝트, 의사결정 원칙 등) */
        sidebarCategory:
          "text-[18px] font-bold leading-normal text-[#000] normal-case tracking-normal [font-style:normal] [font-family:var(--font-login-title)]",
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
      /** 폼 라벨: 16px / 500 / 150% / -0.32px / Pretendard / default-BK */
      formLabel:
        "block text-[16px] font-medium leading-[150%] tracking-[-0.32px] text-[var(--default-BK)] [font-family:var(--font-login-title)] [margin-bottom:var(--filter-field-label-input-gap)]",
      cardTitle: "mb-1.5 font-bold text-card-foreground",
      cardDescription: "text-app-sm text-muted-foreground",
      detailCode:
        "mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground",
      listTitle: "mb-1.5 font-bold text-foreground",
      listDescription: "text-app-sm text-muted-foreground",
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
      statLabel: "mb-2.5 text-app-sm text-muted-foreground",
      statSub: "mt-2 text-xs text-muted-foreground",
      /** 대시보드 타이틀 티어: 16 / 700 / #000 — 섹션·KPI 라벨·카드 주제·이력 요약 */
      dashboardTitle:
        "text-[16px] font-bold leading-normal text-[#000] [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 디스크립션 티어: 14 / 400 / #000 @ 50% — 부연·KPI 부제 등 */
      dashboardDesc:
        "text-[14px] font-normal leading-normal text-[#000]/50 [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 캡션: 12 / 400 / muted @ 50% — 시각·부가 메타 */
      dashboardCaption:
        "text-[12px] font-normal leading-normal text-muted-foreground/50 [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 빈 상태·플레이스홀더 */
      dashboardEmpty:
        "text-[14px] font-normal leading-normal text-muted-foreground/50 [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 테이블 헤더: 타이틀보다 한 단계 가벼운 강조 */
      dashboardTableHead:
        "text-[14px] font-semibold leading-normal text-[#000] [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 테이블 본문 셀 (디스크립션 티어 @ 50%) */
      dashboardTableCell:
        "text-[14px] font-normal leading-normal text-[#000]/50 [font-style:normal] [font-family:var(--font-login-title)]",
      /** 대시보드 테이블 수치·보조 열 (디스크립션 티어 @ 50%) */
      dashboardTableNumeric:
        "text-[14px] font-normal leading-normal tabular-nums text-muted-foreground/50 [font-style:normal] [font-family:var(--font-login-title)]",
      commentAuthor: "mb-1.5 font-bold text-foreground",
      commentMeta: "mb-1.5 text-xs text-muted-foreground",
      emptyDetail: "px-2.5 py-8 text-center text-muted-foreground",
      sidebarBrandName: "text-app-md font-bold leading-normal text-[#000]",
      sidebarBrandSub: "mt-1 text-xs leading-normal text-[#000]",
      sidebarNav: "leading-normal text-[#000]",
      sidebarProjectName: "mb-2 font-bold leading-normal text-[#000]",
      sidebarProjectMeta: "text-app-sm leading-normal text-[#000]",
      sidebarFooter:
        "text-app-2xs leading-normal tracking-widest text-[#000] uppercase",
      sidebarList:
        "m-0 list-disc space-y-0 pl-app-7 text-sm leading-normal text-[#000]",
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

export type StatAppearance = "default" | "dashboard"

export type StatValueProps = React.ComponentPropsWithoutRef<"div"> & {
  appearance?: StatAppearance
}

export function StatValue({
  className,
  appearance = "default",
  ...props
}: StatValueProps) {
  return (
    <div
      className={cn(
        appearance === "dashboard"
          ? "text-[40px] font-bold leading-normal text-[#000] tabular-nums [font-style:normal] [font-family:var(--font-login-title)]"
          : "text-app-stat font-bold tracking-tight text-card-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export type StatLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  appearance?: StatAppearance
}

export function StatLabel({
  className,
  appearance = "default",
  ...props
}: StatLabelProps) {
  return (
    <div
      className={cn(
        textVariants({
          variant: appearance === "dashboard" ? "dashboardTitle" : "statLabel",
        }),
        appearance === "dashboard" && "mb-1",
        className,
      )}
      {...props}
    />
  )
}

export type StatSubProps = React.ComponentPropsWithoutRef<"div"> & {
  appearance?: StatAppearance
}

export function StatSub({
  className,
  appearance = "default",
  ...props
}: StatSubProps) {
  return (
    <div
      className={cn(
        textVariants({
          variant: appearance === "dashboard" ? "dashboardDesc" : "statSub",
        }),
        appearance === "dashboard" && "mb-[22px]",
        className,
      )}
      {...props}
    />
  )
}

/** Shared class for modal close icon buttons (×). */
export const modalCloseIconClassName =
  "border-none bg-transparent p-0 !text-2xl font-normal leading-none text-muted-foreground hover:text-foreground"
