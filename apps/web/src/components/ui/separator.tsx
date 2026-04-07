"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  tabIndex = -1,
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      tabIndex={tabIndex}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical"
          ? "w-px self-stretch"
          : "h-px w-full",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
