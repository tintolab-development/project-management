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
        "flex min-h-16 w-full resize-y rounded-lg border border-input bg-transparent px-app-3-5 py-app-3-5 text-base transition-colors outline-none md:text-sm",
        "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:font-medium placeholder:leading-[150%] placeholder:tracking-[-0.36px] placeholder:text-[18px] placeholder:text-[var(--gray-999999)] placeholder:opacity-60 placeholder:[font-family:var(--font-login-title)]",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
