import axios, { type AxiosRequestConfig, isAxiosError } from "axios"

import { apiBasePath } from "@/shared/config/apiBase"

let authTokenGetter: () => string | null = () => null

/** 앱 부트스트랩 시 한 번 등록하면 이후 모든 요청에 `Authorization`이 붙습니다. */
export function setHttpClientAuthTokenGetter(getToken: () => string | null): void {
  authTokenGetter = getToken
}

function messageFromAxiosData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined
  const rec = data as Record<string, unknown>
  if (typeof rec.error === "string") return rec.error
  if (typeof rec.message === "string") return rec.message
  return undefined
}

export const httpClient = axios.create({
  baseURL: apiBasePath,
  headers: { "Content-Type": "application/json" },
})

httpClient.interceptors.request.use((config) => {
  const token = authTokenGetter()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const serverMsg =
        messageFromAxiosData(error.response?.data) ?? error.message ?? "요청에 실패했습니다."
      return Promise.reject(new Error(serverMsg))
    }
    return Promise.reject(error instanceof Error ? error : new Error("요청에 실패했습니다."))
  },
)

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await httpClient.get<T>(url, config)
  return data
}

export async function apiDelete(url: string, config?: AxiosRequestConfig): Promise<void> {
  await httpClient.delete(url, config)
}

export async function apiPost<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await httpClient.post<TResponse>(url, body, config)
  return data
}

export async function apiPut<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await httpClient.put<TResponse>(url, body, config)
  return data
}

export async function apiPatch<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const { data } = await httpClient.patch<TResponse>(url, body, config)
  return data
}
