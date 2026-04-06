import type { PillTone } from "./Pill"

/** Maps legacy global `.pill.*` modifier class names to `Pill` tones. */
export function pillToneFromLegacyClass(style: string): PillTone {
  const s = style.trim()
  if (s === "primary") return "primary"
  if (s === "dark") return "dark"
  if (s === "danger") return "danger"
  if (s === "warn") return "warn"
  if (s === "success") return "success"
  return "neutral"
}
