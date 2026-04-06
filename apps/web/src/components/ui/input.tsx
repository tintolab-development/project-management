import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Shared field chrome for native `<select>` and other controls aligned with `Input`. */
export const inputControlClassName = cn(
  "h-8 w-full min-w-0 overflow-hidden text-ellipsis rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none md:text-sm",
  "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.36px] placeholder:text-[18px] placeholder:text-[var(--gray-999999)] placeholder:opacity-60 placeholder:[font-family:var(--font-login-title)]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
)

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        inputControlClassName,
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
