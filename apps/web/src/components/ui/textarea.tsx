import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    "box-border flex resize-y rounded-lg border border-input bg-transparent text-[length:var(--font-size-base)] font-normal leading-normal transition-colors outline-none [font-family:var(--font-login-title)]",
    "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:not-italic placeholder:font-normal placeholder:leading-normal placeholder:text-[length:var(--input-placeholder-max-size)] placeholder:text-[var(--input-placeholder-fg)] placeholder:opacity-[var(--input-placeholder-opacity)] placeholder:[font-family:var(--font-login-title)]",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      fieldSize: {
        sm: "min-h-[var(--textarea-min-height-sm)] px-[var(--input-field-padding-compact)] py-[var(--input-field-padding-compact)]",
        md: "min-h-[var(--textarea-min-height-md)] px-[var(--input-field-padding)] py-[var(--input-field-padding)]",
        lg: "min-h-[var(--textarea-min-height-lg)] px-[var(--input-field-padding)] py-[var(--input-field-padding)]",
      },
      fieldWidth: {
        full: "w-full min-w-0",
        field: "w-full min-w-0 max-w-[var(--filter-field-max-width)]",
      },
    },
    defaultVariants: {
      fieldSize: "md",
      fieldWidth: "full",
    },
  },
)

export type TextareaFieldSize = NonNullable<VariantProps<typeof textareaVariants>["fieldSize"]>
export type TextareaFieldWidth = NonNullable<VariantProps<typeof textareaVariants>["fieldWidth"]>

export { textareaVariants }

export type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, fieldSize, fieldWidth, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(textareaVariants({ fieldSize, fieldWidth }), className)}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
