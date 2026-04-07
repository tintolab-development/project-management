import "@toast-ui/editor/dist/toastui-editor.css"

import { Editor as ToastEditor } from "@toast-ui/react-editor"
import type { EditorProps } from "@toast-ui/react-editor"
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react"

import { cn } from "@/lib/utils"

import styles from "./MarkdownTextEditor.module.css"

export type MarkdownTextEditorHandle = {
  getMarkdown: () => string
  focus: () => void
  blur: () => void
}

export type MarkdownTextEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (markdown: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  minHeight?: string
  height?: string
  initialEditType?: EditorProps["initialEditType"]
  previewStyle?: EditorProps["previewStyle"]
  hideModeSwitch?: boolean
  useCommandShortcut?: boolean
  toolbarItems?: EditorProps["toolbarItems"]
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

const normalizeMarkdownForCompare = (md: string) =>
  md.replace(/\r\n/g, "\n").trimEnd()

const markdownMatchesProp = (editorMd: string, propMd: string) =>
  normalizeMarkdownForCompare(editorMd) === normalizeMarkdownForCompare(propMd)

const emitMarkdown = (
  ref: RefObject<InstanceType<typeof ToastEditor> | null>,
  onChange?: (markdown: string) => void,
) => {
  const md = ref.current?.getInstance()?.getMarkdown() ?? ""
  onChange?.(md)
}

const applyPropMarkdownToInstance = (
  inst: { getMarkdown: () => string; setMarkdown: (md: string) => void } | null | undefined,
  next: string,
) => {
  if (!inst) return
  const current = inst.getMarkdown()
  if (markdownMatchesProp(current, next)) return
  inst.setMarkdown(next)
}

export const MarkdownTextEditor = forwardRef<
  MarkdownTextEditorHandle,
  MarkdownTextEditorProps
>(function MarkdownTextEditor(
  {
    value,
    defaultValue = "",
    onChange,
    onBlur,
    placeholder,
    disabled = false,
    className,
    id,
    minHeight = "160px",
    height,
    initialEditType = "wysiwyg",
    previewStyle = "tab",
    hideModeSwitch = true,
    useCommandShortcut = true,
    toolbarItems,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  },
  ref,
) {
  const editorRef = useRef<InstanceType<typeof ToastEditor>>(null)
  const isControlled = value !== undefined
  const initialMarkdown = isControlled ? (value ?? "") : defaultValue
  const controlledMarkdown = value ?? ""

  const syncControlledValue = useCallback(() => {
    if (!isControlled) return
    const inst = editorRef.current?.getInstance()
    applyPropMarkdownToInstance(inst, controlledMarkdown)
  }, [isControlled, controlledMarkdown])

  useLayoutEffect(() => {
    syncControlledValue()
  }, [syncControlledValue])

  const handleLoad = useCallback(
    (inst: { getMarkdown: () => string; setMarkdown: (md: string, cursorToEnd?: boolean) => void }) => {
      if (isControlled) {
        applyPropMarkdownToInstance(inst, controlledMarkdown)
      }
      /* 첫 페인트에서 툴바 폭이 0이면 Toast가 버튼을 전부 드롭다운으로 보냄 → 레이아웃 확정 후 재계산 */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("resize"))
        })
      })
    },
    [controlledMarkdown, isControlled],
  )

  const handleChange = useCallback(() => {
    queueMicrotask(() => emitMarkdown(editorRef, onChange))
  }, [onChange])

  const handleBlur = useCallback(() => {
    onBlur?.()
  }, [onBlur])

  useImperativeHandle(ref, () => ({
    getMarkdown: () => editorRef.current?.getInstance()?.getMarkdown() ?? "",
    focus: () => {
      editorRef.current?.getInstance()?.focus()
    },
    blur: () => {
      editorRef.current?.getInstance()?.blur()
    },
  }))

  return (
    <div
      id={id}
      className={cn(styles.root, disabled && styles.disabled, className)}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <ToastEditor
        ref={editorRef}
        initialValue={initialMarkdown}
        placeholder={placeholder}
        previewStyle={previewStyle}
        initialEditType={initialEditType}
        hideModeSwitch={hideModeSwitch}
        useCommandShortcut={useCommandShortcut && !disabled}
        usageStatistics={false}
        {...(height !== undefined ? { height } : {})}
        minHeight={minHeight}
        {...(toolbarItems != null
          ? { toolbarItems }
          : {})}
        onChange={disabled || !onChange ? undefined : handleChange}
        onLoad={disabled ? undefined : handleLoad}
        onBlur={disabled || !onBlur ? undefined : handleBlur}
      />
    </div>
  )
})
