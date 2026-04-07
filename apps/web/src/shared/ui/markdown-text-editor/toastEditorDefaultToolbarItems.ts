import type { EditorProps } from "@toast-ui/react-editor"

/**
 * @toast-ui/react-editor는 `this.props`를 그대로 `new Editor(options)`에 넘깁니다.
 * `toolbarItems={undefined}`처럼 키만 있고 값이 undefined이면 Toast 내부 `extend()`가
 * 기본 툴바 배열을 undefined로 덮어써 버튼이 전부 사라집니다.
 * @see https://nhn.github.io/tui.editor/latest/ — Default Options / toolbarItems
 */
export const toastEditorDefaultToolbarItems: NonNullable<
  EditorProps["toolbarItems"]
> = [
  ["heading", "bold", "italic", "strike"],
  ["hr", "quote"],
  ["ul", "ol", "task", "indent", "outdent"],
  ["table", "image", "link"],
  ["code", "codeblock"],
  ["scrollSync"],
]
