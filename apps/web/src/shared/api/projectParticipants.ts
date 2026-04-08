import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { httpClient } from "./httpClient"

export const projectParticipantSchema = z.object({
  id: z.string(),
  affiliation: z.string(),
  name: z.string(),
  jobTitle: z.string(),
})

export type ProjectParticipant = z.infer<typeof projectParticipantSchema>

const projectParticipantListSchema = z.array(projectParticipantSchema)

export type ProjectParticipantsListParams = {
  affiliation: string
  name: string
}

export const projectParticipantsQueryKeys = {
  all: ["project-participants"] as const,
  list: (projectSlug: string, params: ProjectParticipantsListParams) =>
    [...projectParticipantsQueryKeys.all, projectSlug, params] as const,
}

export async function fetchProjectParticipants(
  projectSlug: string,
  params: ProjectParticipantsListParams,
): Promise<ProjectParticipant[]> {
  const { data } = await httpClient.get<unknown>(
    `projects/${encodeURIComponent(projectSlug)}/participants`,
    { params },
  )
  return projectParticipantListSchema.parse(data)
}

type ListKey = ReturnType<typeof projectParticipantsQueryKeys.list>

export function useProjectParticipantsQuery(
  projectSlug: string,
  params: ProjectParticipantsListParams,
  options?: Omit<
    UseQueryOptions<ProjectParticipant[], Error, ProjectParticipant[], ListKey>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    ...options,
    queryKey: projectParticipantsQueryKeys.list(projectSlug, params),
    queryFn: () => fetchProjectParticipants(projectSlug, params),
  })
}

export const participantToAssigneeLabel = (p: ProjectParticipant): string =>
  `${p.name} | ${p.affiliation}`
