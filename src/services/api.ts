import axios from "axios"

export type ApiValidationError = {
  field: string
  message: string
}

export type NormalizedApiError = Error & {
  status: number
  validationErrors?: ApiValidationError[]
}

const API_ERROR_EVENT = "api:error"

function normalizeAxiosError(error: any): NormalizedApiError {
  const status = error?.response?.status ?? 0
  const data = error?.response?.data

  const message: string =
    data?.message ||
    data?.error ||
    error?.message ||
    "Une erreur est survenue."

  const validationErrors: ApiValidationError[] | undefined = Array.isArray(
    data?.validationErrors,
  )
    ? data.validationErrors
        .filter((v: any) => v && typeof v.field === "string")
        .map((v: any) => ({
          field: String(v.field),
          message: String(v.message ?? "Invalide"),
        }))
    : undefined

  const err = Object.assign(new Error(message), {
    name: "ApiError",
    status,
    validationErrors,
  }) as NormalizedApiError

  return err
}

function emitGlobalApiError(err: NormalizedApiError) {
  // Minimal global error bus for toasts / logging.
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, { detail: err }))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8083",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeAxiosError(error)
    const skipGlobalError = Boolean((error?.config as any)?.skipGlobalError)

    if (!skipGlobalError) {
      emitGlobalApiError(normalized)
    }

    return Promise.reject(normalized)
  },
)

export default api
