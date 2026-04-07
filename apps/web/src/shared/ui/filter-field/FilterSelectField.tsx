import { Check, ChevronDown } from "lucide-react"
import { useId, useRef, useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

import panelStyles from "./FilterDropdownPanel.module.css"
import { FilterFieldShell } from "./FilterFieldShell"
import { filterFieldLabelDomId } from "./filterFieldLabelDomId"

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
  /** Tasks 패널 등 전폭 필드 */
  fullWidth?: boolean
  labelClassName?: string
  /**
   * 옵션 목록에 없는 `value`(예: URL로 들어온 id)도 한글 라벨로 표시
   */
  resolveDisplayLabel?: (value: string) => string | undefined
  /**
   * `showAllOption={false}`일 때 선택 후 비우기 — 팝오버 하단에「선택 해제」
   */
  clearable?: boolean
}

function triggerLabel(
  value: string,
  placeholder: string,
  options: FilterSelectOption[],
  showAllOption: boolean,
  allLabel: string,
  resolveDisplayLabel?: (value: string) => string | undefined,
): string {
  if (value === "") {
    if (showAllOption) return allLabel
    return placeholder
  }
  const opt = options.find((o) => o.value === value)
  if (opt) return opt.label
  const resolved = resolveDisplayLabel?.(value)
  if (resolved !== undefined && resolved !== "") return resolved
  return value
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
  fullWidth,
  labelClassName,
  resolveDisplayLabel,
  clearable,
}: FilterSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const shellBodyRef = useRef<HTMLDivElement>(null)
  const clearBtnId = useId()
  const listboxId = `${controlId}-listbox`

  const summary = triggerLabel(
    value,
    placeholder,
    options,
    showAllOption,
    allLabel,
    resolveDisplayLabel,
  )
  const showClearFooter =
    Boolean(clearable) && !showAllOption && value !== ""
  const showMutedPlaceholder = value === "" && !showAllOption

  const isAllSelected = showAllOption && value === ""

  return (
    <FilterFieldShell
      ref={shellBodyRef}
      label={label}
      controlId={controlId}
      className={className}
      fullWidth={fullWidth}
      labelClassName={labelClassName}
    >
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger
          id={controlId}
          type="button"
          disabled={disabled}
          aria-labelledby={filterFieldLabelDomId(controlId)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          className={cn(
            "inline-flex w-full min-w-0 flex-1 items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-[length:var(--font-size-base)] font-normal leading-normal shadow-none outline-none transition-colors [font-family:var(--font-login-title)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showMutedPlaceholder && "text-muted-foreground",
          )}
        >
          <span className="min-w-0 truncate">{summary}</span>
          <ChevronDown
            className={cn(
              "pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200",
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
            id={listboxId}
            className={panelStyles.optionList}
            role="listbox"
            aria-label={`${label} 옵션`}
          >
            {showAllOption ? (
              <button
                key="__all__"
                type="button"
                role="option"
                aria-selected={isAllSelected}
                className={panelStyles.optionRow}
                onClick={() => {
                  onValueChange("")
                  setOpen(false)
                }}
              >
                <span className={panelStyles.optionIndicator} aria-hidden>
                  {isAllSelected ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : null}
                </span>
                <span className={panelStyles.optionLabel}>{allLabel}</span>
              </button>
            ) : null}
            {options.map((opt) => {
              const selected = value === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={panelStyles.optionRow}
                  onClick={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className={panelStyles.optionIndicator} aria-hidden>
                    {selected ? <Check className="size-4" strokeWidth={2.5} /> : null}
                  </span>
                  <span className={panelStyles.optionLabel}>{opt.label}</span>
                </button>
              )
            })}
          </div>
          {showClearFooter ? (
            <div className={panelStyles.popoverFooter}>
              <Button
                id={clearBtnId}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onValueChange("")
                  setOpen(false)
                }}
              >
                선택 해제
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </FilterFieldShell>
  )
}
