import type { Comment } from "@/entities/comment/model/types"

import { apiPost } from "./httpClient"

export type TaskDraftCommentResponse = {
  id: string
  author: string
  body: string
  createdAt: string
}

export async function postTaskDraftComment(payload: {
  author: string
  body: string
}): Promise<TaskDraftCommentResponse> {
  return apiPost<TaskDraftCommentResponse, typeof payload>(
    "/task-drafts/comments",
    payload,
  )
}

export async function postItemComment(
  itemId: string,
  payload: { author: string; body: string },
): Promise<Comment> {
  return apiPost<Comment, typeof payload>(`/items/${itemId}/comments`, payload)
}
