export const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")

export const normalizeTextValue = (value: unknown) => String(value ?? "").trim()
