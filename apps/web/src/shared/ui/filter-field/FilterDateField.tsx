import { format, isValid, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useId, useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

import { FilterFieldShell } from "./FilterFieldShell"

export type FilterDateFieldProps = {
  label: string
  placeholder: string
  /** `YYYY-MM-DD` or empty string for no filter */
  value: string
  onValueChange: (next: string) => void
  disabled?: boolean
  controlId: string
  className?: string
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
}: FilterDateFieldProps) {
  const [open, setOpen] = useState(false)
  const clearId = useId()
  const selected = parseFilterDate(value)

  const labelText = selected
    ? format(selected, "yyyy.MM.dd", { locale: ko })
    : placeholder

  return (
    <FilterFieldShell label={label} controlId={controlId} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={controlId}
          disabled={disabled}
          type="button"
          className={cn(
            "inline-flex w-full min-w-0 flex-1 items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-sm shadow-none outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="min-w-0 truncate">{labelText}</span>
          <CalendarIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-[17.5rem] p-0 sm:min-w-[18.5rem]"
          align="start"
        >
          <Calendar
            mode="single"
            locale={ko}
            showWeekNumber
            selected={selected}
            defaultMonth={selected}
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
