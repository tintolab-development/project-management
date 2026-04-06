import { normalizeAppState } from "@/entities/app-state/lib/normalizeAppState"
import { createSeedData } from "@/entities/app-state/model/seed"
import type { AppState } from "@/entities/app-state/model/types"

let snapshot: AppState = structuredClone(createSeedData())

export const mockAppStateStore = {
  getSnapshot(): AppState {
    return structuredClone(snapshot)
  },

  replaceFromRaw(raw: unknown): AppState {
    snapshot = normalizeAppState(raw)
    return structuredClone(snapshot)
  },

  reset(): AppState {
    snapshot = structuredClone(createSeedData())
    return structuredClone(snapshot)
  },
}
