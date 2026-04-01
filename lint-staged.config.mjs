const webPath = (files) =>
  files.map((f) => f.replace(/^apps\/web\//, "")).join(" ")

export default {
  "apps/web/**/*.{ts,tsx}": (files) => {
    if (!files.length) return []
    const rel = webPath(files)
    return `pnpm --filter @tdw/web exec eslint --fix ${rel}`
  },
  "*.{json,md,css,yml,yaml}": ["prettier --write"]
}
