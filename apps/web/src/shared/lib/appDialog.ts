import { create } from "zustand"

type Active =
  | { kind: "alert"; message: string; resolve: () => void }
  | { kind: "confirm"; message: string; resolve: (v: boolean) => void }
  | {
      kind: "prompt"
      message: string
      defaultValue: string
      resolve: (v: string | null) => void
    }

const queue: Active[] = []

export const useAppDialogStore = create<{ active: Active | null }>(() => ({
  active: null,
}))

const sync = () => {
  useAppDialogStore.setState({ active: queue[0] ?? null })
}

export const appAlert = (message: string): Promise<void> =>
  new Promise((resolve) => {
    queue.push({ kind: "alert", message, resolve })
    sync()
  })

export const appConfirm = (message: string): Promise<boolean> =>
  new Promise((resolve) => {
    queue.push({ kind: "confirm", message, resolve })
    sync()
  })

export const appPrompt = (
  message: string,
  defaultValue = "",
): Promise<string | null> =>
  new Promise((resolve) => {
    queue.push({ kind: "prompt", message, defaultValue, resolve })
    sync()
  })

/**
 * alert: result 무시
 * confirm: true / false
 * prompt: 문자열 또는 취소 시 null
 */
export const resolveAppDialog = (result?: boolean | string | null) => {
  const first = queue.shift()
  if (!first) return
  if (first.kind === "alert") {
    first.resolve()
  } else if (first.kind === "confirm") {
    first.resolve(Boolean(result))
  } else {
    first.resolve(
      result === undefined || result === null
        ? null
        : String(result),
    )
  }
  sync()
}
