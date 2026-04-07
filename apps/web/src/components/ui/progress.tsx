import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max = 100, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    max={max}
    value={value}
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-progress-track)]",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full rounded-full bg-gradient-to-r from-[var(--chart-fill-start)] to-[var(--chart-fill-end)] transition-transform duration-300 ease-out"
      style={{
        transform: `translateX(-${100 - (value != null && max ? (100 * value) / max : 0)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
