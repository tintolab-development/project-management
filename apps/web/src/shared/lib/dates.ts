const excelSerialToDate = (serial: number) => {
  const base = new Date(Date.UTC(1899, 11, 30))
  const date = new Date(base.getTime() + serial * 86400000)
  return date.toISOString().slice(0, 10)
}

export const normalizeDateInput = (raw: unknown) => {
  const value = String(raw ?? "").trim()
  if (!value) return ""

  if (/^\d{5}$/.test(value) || /^\d{4,5}\.\d+$/.test(value)) {
    const n = Number(value)
    if (Number.isFinite(n)) return excelSerialToDate(n)
    return ""
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const m1 = value.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/)
  if (m1) {
    const y = m1[1]
    const mo = String(Number(m1[2])).padStart(2, "0")
    const d = String(Number(m1[3])).padStart(2, "0")
    return `${y}-${mo}-${d}`
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return ""
}
