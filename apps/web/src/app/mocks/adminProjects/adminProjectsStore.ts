import type { AdminProjectsListFilters } from "@/features/admin-projects/lib/adminProjectsListParams"
import type { AdminProject } from "@/features/admin-projects/model/adminProject"

import { ADMIN_PROJECTS_SEED } from "./adminProjectsSeed"

function parseYmd(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const ms = Date.parse(`${t}T00:00:00`)
  if (Number.isNaN(ms)) return null
  return ms
}

function periodOverlapsFilter(
  startDate: string,
  endDate: string,
  from: string,
  to: string,
): boolean {
  const fs = parseYmd(from)
  const ft = parseYmd(to)
  if (fs === null && ft === null) return true
  const ps = parseYmd(startDate)
  const pe = parseYmd(endDate)
  if (ps === null || pe === null) return true

  const rangeStart = fs ?? -Infinity
  const rangeEnd = ft ?? Infinity
  return pe >= rangeStart && ps <= rangeEnd
}

function matchesQuery(project: AdminProject, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [
    project.name,
    project.description,
    ...project.participantNames,
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

function filterProjects(
  list: AdminProject[],
  filters: AdminProjectsListFilters,
): AdminProject[] {
  return list.filter((p) => {
    if (!matchesQuery(p, filters.q)) return false
    if (filters.type && p.projectType !== filters.type) return false
    if (filters.status && p.status !== filters.status) return false
    if (!periodOverlapsFilter(p.startDate, p.endDate, filters.from, filters.to)) {
      return false
    }
    return true
  })
}

let rows: AdminProject[] = structuredClone(ADMIN_PROJECTS_SEED)

export const adminProjectsStore = {
  getSnapshot(): AdminProject[] {
    return structuredClone(rows)
  },

  list(filters: AdminProjectsListFilters): AdminProject[] {
    return filterProjects(structuredClone(rows), filters)
  },

  remove(id: string): boolean {
    const i = rows.findIndex((r) => r.id === id)
    if (i === -1) return false
    rows = rows.filter((r) => r.id !== id)
    return true
  },

  add(project: Omit<AdminProject, "id">): AdminProject {
    const nextId = (() => {
      const nums = rows.map((r) => {
        const m = /^ap-(\d+)$/.exec(r.id)
        return m ? Number(m[1]) : 0
      })
      const max = nums.length ? Math.max(...nums) : 0
      return `ap-${String(max + 1).padStart(3, "0")}`
    })()
    const row: AdminProject = { ...project, id: nextId }
    rows = [...rows, row]
    return structuredClone(row)
  },

  reset(): void {
    rows = structuredClone(ADMIN_PROJECTS_SEED)
  },
}
