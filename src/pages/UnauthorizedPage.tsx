import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Accès refusé
      </h1>

      <p className="text-gray-600 max-w-md mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>

      <Button onClick={() => navigate(-1)}>
        Retour
      </Button>
    </div>
  )
}
