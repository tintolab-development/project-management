import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "box-border flex min-h-16 w-full resize-y rounded-lg border border-input bg-transparent px-[var(--input-field-padding)] py-[var(--input-field-padding)] text-[length:var(--font-size-base)] font-normal leading-normal transition-colors outline-none [font-family:var(--font-login-title)]",
        "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:not-italic placeholder:font-normal placeholder:leading-normal placeholder:text-[length:var(--input-placeholder-max-size)] placeholder:text-[var(--input-placeholder-fg)] placeholder:opacity-[var(--input-placeholder-opacity)] placeholder:[font-family:var(--font-login-title)]",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
