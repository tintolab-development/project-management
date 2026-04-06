import { cva } from "class-variance-authority"

/**
 * Wireframe-aligned button styles (10px radius, #000 / #FFF).
 * Used when `appearance` or `dimension` is set on {@link Button}.
 * Icons: `data-icon="inline-start"` | `data-icon="inline-end"` (see [shadcn Button](https://ui.shadcn.com/docs/components/radix/button)).
 */
export const dsButtonVariants = cva(
  "box-border inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-[10px] text-sm font-medium whitespace-nowrap transition-colors outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  {
    variants: {
      appearance: {
        fill:
          "border border-transparent bg-black text-white hover:bg-neutral-900 focus-visible:border-white/50 focus-visible:ring-3 focus-visible:ring-white/35 aria-invalid:border-destructive aria-invalid:ring-destructive/30 dark:hover:bg-neutral-800",
        outline:
          "border border-black bg-white text-black hover:bg-neutral-50 focus-visible:border-black focus-visible:ring-3 focus-visible:ring-black/25 aria-invalid:border-destructive aria-invalid:text-destructive dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900 dark:focus-visible:ring-white/25",
      },
      dimension: {
        hug: "h-10 w-auto min-w-0 px-4",
        treeInline:
          "h-auto min-h-[34px] w-auto min-w-0 px-2.5 py-1.5 text-[13px] font-medium leading-tight",
        compact: "h-[50px] min-w-[69px] px-4",
        fixedMd: "h-10 w-[160px] shrink-0 px-4",
        fixedLg: "h-[52px] w-[160px] shrink-0 px-4",
        stretchSm: "h-10 w-full px-4",
        stretchMd: "h-[52px] w-full px-4",
        stretchBetween: "h-10 w-full justify-between px-4",
        stretchBetweenMd: "h-[52px] w-full justify-between px-4",
        stretchCompact: "h-[50px] w-full px-4",
      },
    },
    defaultVariants: {
      appearance: "fill",
      dimension: "fixedMd",
    },
  }
)
