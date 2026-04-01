export const parseDelimited = (text: string, delimiter: string) => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell)
      cell = ""
      continue
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)

  return rows
    .map((eachRow) => eachRow.map((value) => String(value ?? "").trim()))
    .filter((eachRow) => eachRow.some((value) => value !== ""))
}

export const guessDelimiter = (text: string) => {
  const head = text.split(/\r?\n/).slice(0, 5).join("\n")
  const tabCount = (head.match(/\t/g) || []).length
  const commaCount = (head.match(/,/g) || []).length
  const semicolonCount = (head.match(/;/g) || []).length

  if (tabCount > 0) return "\t"
  if (semicolonCount > commaCount) return ";"
  return ","
}
