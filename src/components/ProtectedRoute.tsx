import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role") // suppose que tu stockes le role

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
