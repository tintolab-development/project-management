import "@toast-ui/editor/dist/toastui-editor.css"

import type { EditorProps } from "@toast-ui/react-editor"
import { Editor as ToastEditor } from "@toast-ui/react-editor"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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

const emitMarkdown = (
  ref: RefObject<InstanceType<typeof ToastEditor> | null>,
  onChange?: (markdown: string) => void,
) => {
  const md = ref.current?.getInstance()?.getMarkdown() ?? ""
  onChange?.(md)
}

export const MarkdownTextEditor = forwardRef<
  MarkdownTextEditorHandle,
  MarkdownTextEditorProps
>(function MarkdownTextEditor(
  {
    value,
    defaultValue = "",
    onChange,
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

  useEffect(() => {
    if (!isControlled) return
    const inst = editorRef.current?.getInstance()
    if (!inst) return
    const next = value ?? ""
    if (inst.getMarkdown() !== next) {
      inst.setMarkdown(next)
    }
  }, [isControlled, value])

  const handleChange = useCallback(() => {
    emitMarkdown(editorRef, onChange)
  }, [onChange])

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
        toolbarItems={toolbarItems}
        onChange={disabled ? undefined : handleChange}
      />
    </div>
  )
})
