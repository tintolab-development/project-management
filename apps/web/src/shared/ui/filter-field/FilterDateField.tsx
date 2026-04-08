import { format, isValid, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useId, useRef, useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import { buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

import { FilterFieldShell } from "./FilterFieldShell"
import { filterFieldLabelDomId } from "./filterFieldLabelDomId"

import dateFieldStyles from "./FilterDateField.module.css"

export type FilterDateFieldProps = {
  label: string
  placeholder: string
  /** `YYYY-MM-DD` or empty string for no filter */
  value: string
  onValueChange: (next: string) => void
  disabled?: boolean
  controlId: string
  className?: string
  /** 그리드 열 등에서 `max-width: 280px` 제한 해제 */
  fullWidth?: boolean
  labelClassName?: string
  portalContainer?: HTMLElement | null
}

function parseFilterDate(raw: string): Date | undefined {
  if (!raw.trim()) return undefined
  const d = parseISO(raw)
  return isValid(d) ? d : undefined
}

export function FilterDateField({
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  controlId,
  className,
  fullWidth,
  labelClassName,
  portalContainer,
}: FilterDateFieldProps) {
  const [open, setOpen] = useState(false)
  const clearId = useId()
  const shellBodyRef = useRef<HTMLDivElement>(null)
  const selected = parseFilterDate(value)

  const labelText = selected
    ? format(selected, "yyyy.MM.dd", { locale: ko })
    : placeholder

  return (
    <FilterFieldShell
      ref={shellBodyRef}
      label={label}
      controlId={controlId}
      className={className}
      fullWidth={fullWidth}
      labelClassName={labelClassName}
      bodyClassName={dateFieldStyles.plainShellBody}
    >
      {/*
       * shadcn/ui Date Picker — Popover + outline Button 트리거 + Calendar, PopoverContent `w-auto p-0`
       * https://ui.shadcn.com/docs/components/radix/date-picker
       */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={controlId}
          disabled={disabled}
          type="button"
          aria-labelledby={filterFieldLabelDomId(controlId)}
          aria-haspopup="dialog"
          data-empty={selected ? undefined : true}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "h-[var(--filter-control-height)] min-h-[var(--filter-control-height)] max-h-[var(--filter-control-height)] w-full min-w-0 justify-start gap-2 px-4 text-left text-[length:var(--admin-list-filter-input-font-size)] font-normal leading-normal [font-family:var(--font-login-title)]",
            "rounded-[var(--filter-control-radius)] border-[var(--filter-control-border)] bg-[var(--panel)] shadow-none",
            "data-[empty]:text-muted-foreground aria-expanded:bg-[var(--panel)]",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{labelText}</span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          anchor={shellBodyRef}
          portalContainer={portalContainer}
          className="gap-0 p-0"
        >
          <Calendar
            mode="single"
            locale={ko}
            selected={selected}
            defaultMonth={selected}
            className="rounded-md border-0 bg-popover p-3 text-popover-foreground shadow-none"
            classNames={{ root: "w-full min-w-0" }}
            onSelect={(d) => {
              if (!d) return
              onValueChange(format(d, "yyyy-MM-dd"))
              setOpen(false)
            }}
          />
          {selected ? (
            <div className="border-t border-border p-2">
              <Button
                id={clearId}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onValueChange("")
                  setOpen(false)
                }}
              >
                필터 해제
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </FilterFieldShell>
  )
}
