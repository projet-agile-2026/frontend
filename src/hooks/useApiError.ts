import { useMemo } from "react"
import type { ApiValidationError, NormalizedApiError } from "../services/api"

function isNormalizedApiError(error: any): error is NormalizedApiError {
  return (
    error instanceof Error &&
    typeof error.status === "number" &&
    (error.validationErrors === undefined || Array.isArray(error.validationErrors))
  )
}

function formatValidationErrors(validationErrors: ApiValidationError[]) {
  return validationErrors
    .map((v) => `${v.field}: ${v.message}`)
    .join("\n")
}

export function useApiError(error: unknown) {
  return useMemo(() => {
    if (!error) return ""

    if (isNormalizedApiError(error)) {
      if (error.validationErrors && error.validationErrors.length > 0) {
        return `${error.message}\n${formatValidationErrors(error.validationErrors)}`
      }
      return error.message
    }

    if (error instanceof Error) return error.message
    if (typeof error === "string") return error

    try {
      return JSON.stringify(error)
    } catch {
      return "Une erreur est survenue."
    }
  }, [error])
}

