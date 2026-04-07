import { Check, ChevronDown } from "lucide-react"
import { useId, useRef, useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/shared/ui/button"
import panelStyles from "@/shared/ui/filter-field/FilterDropdownPanel.module.css"
import {
  FilterFieldShell,
  filterFieldLabelDomId,
} from "@/shared/ui/filter-field"
import { cn } from "@/lib/utils"

export type WorkspaceMultiSelectOption = {
  value: string
  label: string
}

type WorkspaceMultiSelectFilterProps = {
  label: string
  options: WorkspaceMultiSelectOption[]
  selected: string[]
  onSelectedChange: (next: string[]) => void
  disabled?: boolean
  className?: string
}

function triggerSummary(
  selected: string[],
  options: WorkspaceMultiSelectOption[],
): string {
  if (selected.length === 0) return "전체"
  if (selected.length === 1) {
    const opt = options.find((o) => o.value === selected[0])
    return opt?.label ?? selected[0]
  }
  return `${selected.length}개 선택`
}

export function WorkspaceMultiSelectFilter({
  label,
  options,
  selected,
  onSelectedChange,
  disabled,
  className,
}: WorkspaceMultiSelectFilterProps) {
  const controlId = useId()
  const clearId = useId()
  const shellBodyRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selectedSet = new Set(selected)

  const toggle = (value: string) => {
    const next = new Set(selectedSet)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onSelectedChange([...next])
  }

  return (
    <FilterFieldShell
      ref={shellBodyRef}
      label={label}
      controlId={controlId}
      className={className}
      fullWidth
    >
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger
          id={controlId}
          type="button"
          disabled={disabled}
          aria-labelledby={filterFieldLabelDomId(controlId)}
          aria-haspopup="dialog"
          className={cn(
            "inline-flex w-full min-w-0 flex-1 items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-sm font-normal shadow-none outline-none transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selected.length === 0 && "text-muted-foreground",
          )}
        >
          <span className="min-w-0 truncate">
            {triggerSummary(selected, options)}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground opacity-50 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent
          matchTriggerWidth
          anchor={shellBodyRef}
          className="gap-0 border border-border p-0 shadow-md ring-0"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <div
            className={panelStyles.optionList}
            role="listbox"
            aria-label={`${label} 옵션`}
            aria-multiselectable="true"
          >
            {options.map((opt) => {
              const isOn = selectedSet.has(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isOn}
                  aria-checked={isOn}
                  className={panelStyles.optionRow}
                  onClick={() => toggle(opt.value)}
                >
                  <span className={panelStyles.optionIndicator} aria-hidden>
                    {isOn ? <Check className="size-4" strokeWidth={2.5} /> : null}
                  </span>
                  <span className={panelStyles.optionLabel}>{opt.label}</span>
                </button>
              )
            })}
          </div>
          {selected.length > 0 ? (
            <div className={panelStyles.popoverFooter}>
              <Button
                id={clearId}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onSelectedChange([])
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
