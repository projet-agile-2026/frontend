import { useEffect } from "react"
import { toast } from "sonner"
import type { NormalizedApiError } from "../services/api"

const API_ERROR_EVENT = "api:error"

export function GlobalApiErrorListener() {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as NormalizedApiError | undefined
      if (!detail) return

      const description =
        detail.validationErrors && detail.validationErrors.length > 0
          ? detail.validationErrors
              .map((v) => `${v.field}: ${v.message}`)
              .join(" · ")
          : undefined

      toast.error(detail.message || "Une erreur est survenue.", {
        description,
      })
    }

    window.addEventListener(API_ERROR_EVENT, handler as EventListener)
    return () => window.removeEventListener(API_ERROR_EVENT, handler as EventListener)
  }, [])

  return null
}

