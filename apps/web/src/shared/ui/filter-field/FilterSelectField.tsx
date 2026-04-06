import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { FilterFieldShell } from "./FilterFieldShell"

const ALL_SENTINEL = "__filter_all__"

export type FilterSelectOption = {
  value: string
  label: string
}

export type FilterSelectFieldProps = {
  label: string
  placeholder: string
  options: FilterSelectOption[]
  value: string
  onValueChange: (next: string) => void
  disabled?: boolean
  controlId: string
  allLabel?: string
  showAllOption?: boolean
  className?: string
}

export function FilterSelectField({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  disabled,
  controlId,
  allLabel = "전체",
  showAllOption = true,
  className,
}: FilterSelectFieldProps) {
  const selectValue = value === "" ? ALL_SENTINEL : value

  return (
    <FilterFieldShell label={label} controlId={controlId} className={className}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          onValueChange(v === ALL_SENTINEL ? "" : String(v))
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={controlId}
          className={cn(
            "h-auto min-h-0 w-full flex-1 border-0 bg-transparent py-0 pr-0 pl-0 shadow-none",
            "text-left text-sm data-placeholder:text-muted-foreground",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption ? (
            <SelectItem value={ALL_SENTINEL}>{allLabel}</SelectItem>
          ) : null}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterFieldShell>
  )
}
