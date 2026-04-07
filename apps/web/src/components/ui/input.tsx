import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Shared field chrome for native `<select>` and other controls aligned with `Input`. */
export const inputControlClassName = cn(
  "box-border min-h-[var(--filter-control-height)] w-full min-w-0 overflow-hidden text-ellipsis rounded-lg border border-input bg-transparent px-[var(--input-field-padding)] py-[var(--input-field-padding)] text-[length:var(--font-size-base)] font-normal leading-normal transition-colors outline-none [font-family:var(--font-login-title)]",
  "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:not-italic placeholder:font-normal",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
)

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof InputPrimitive>
>(function Input({ className, type, ...props }, ref) {
  return (
    <span className="input-field-cq">
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          inputControlClassName,
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        {...props}
      />
    </span>
  )
})

Input.displayName = "Input"

export { Input }
