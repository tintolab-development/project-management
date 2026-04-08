import { z } from "zod"

import { httpClient } from "@/shared/api/httpClient"

import {
  adminScheduleEventSchema,
  type AdminScheduleEvent,
} from "../model/adminScheduleEvent"

const adminScheduleEventListSchema = z.array(adminScheduleEventSchema)

export async function fetchAdminScheduleEvents(range: {
  from: string
  to: string
}): Promise<AdminScheduleEvent[]> {
  const params = new URLSearchParams({
    from: range.from,
    to: range.to,
  })
  const { data } = await httpClient.get<unknown>(
    `admin/schedule/events?${params.toString()}`,
  )
  return adminScheduleEventListSchema.parse(data)
}
