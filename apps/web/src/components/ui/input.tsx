import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "box-border overflow-hidden text-ellipsis rounded-[var(--filter-control-radius)] border border-input bg-transparent text-[length:var(--font-size-base)] font-normal leading-normal transition-colors outline-none [font-family:var(--font-login-title)]",
    "placeholder:overflow-hidden placeholder:text-ellipsis placeholder:not-italic placeholder:font-normal",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      fieldSize: {
        sm: "min-h-[var(--field-height-sm)] max-h-[var(--field-height-sm)] px-[var(--input-field-padding-compact)] py-[var(--input-field-padding-compact)]",
        md: "min-h-[var(--field-height-md)] max-h-[var(--field-height-md)] px-[var(--input-field-padding)] py-[var(--input-field-padding)]",
        lg: "min-h-[var(--field-height-lg)] max-h-[var(--field-height-lg)] px-[var(--input-field-padding)] py-[var(--input-field-padding)]",
      },
      fieldWidth: {
        full: "w-full min-w-0",
        field: "w-full min-w-0 max-w-[var(--filter-field-max-width)]",
      },
    },
    defaultVariants: {
      fieldSize: "lg",
      fieldWidth: "full",
    },
  },
)

export type InputFieldSize = NonNullable<VariantProps<typeof inputVariants>["fieldSize"]>
export type InputFieldWidth = NonNullable<VariantProps<typeof inputVariants>["fieldWidth"]>

/** 네이티브 `<select>` 등 `Input`과 크롬을 맞출 때 사용 */
export const inputControlClassName = inputVariants({
  fieldSize: "lg",
  fieldWidth: "full",
})

export { inputVariants }

type InputPrimitiveProps = React.ComponentProps<typeof InputPrimitive>

export type InputProps = Omit<InputPrimitiveProps, "size"> &
  VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, fieldSize, fieldWidth, ...props },
  ref,
) {
  return (
    <span className="input-field-cq">
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({ fieldSize, fieldWidth }),
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
