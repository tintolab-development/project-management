import { format, parseISO } from "date-fns"

/** `YYYY.MM.DD HH:MM:SS` */
export const formatAdminLogEditedAt = (iso: string) => {
  if (!iso) return "-"
  try {
    const d = parseISO(iso)
    if (Number.isNaN(d.getTime())) return "-"
    return format(d, "yyyy.MM.dd HH:mm:ss")
  } catch {
    return "-"
  }
}
