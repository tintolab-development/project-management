import type { AdminProjectStatus, AdminProjectType } from "../model/adminProject"

export const ADMIN_PROJECT_STATUS_LABEL: Record<AdminProjectStatus, string> = {
  in_progress: "진행중",
  upcoming: "예정",
  completed: "완료",
}

export const ADMIN_PROJECT_TYPE_LABEL: Record<AdminProjectType, string> = {
  internal: "사내",
  external: "외부",
  rnd: "R&D",
  poc: "PoC",
}
