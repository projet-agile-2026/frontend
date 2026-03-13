import { useEffect, useState } from "react"
import { getCurrentUser, type UserInfo } from "@/services/authService"

export function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {})
  }, [])

  const getUserDisplayName = () => {
    if (!user) return "Chargement..."
    
    if (user.role === "ADM") return "Administrateur"

    const prenom = user.prenom?.trim()
    const nom = user.nom?.trim()

    if (prenom === null && nom === null) return "Utilisateur inconnu"
    
    return `${prenom || ""} ${nom || ""}`.trim()
  }

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="text-center space-y-4">

        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenue
        </h1>

        <p className="text-xl text-gray-600">
          {getUserDisplayName()}
        </p>

        <p className="text-gray-400 text-sm">
          Plateforme d’évaluation des enseignements
        </p>

      </div>
    </div>
  )
}