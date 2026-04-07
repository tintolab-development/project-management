export async function enableMsw(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MSW === "false") return

  const { worker } = await import("./browser")
  await worker.start({
    onUnhandledRequest: "bypass",
  })
}
