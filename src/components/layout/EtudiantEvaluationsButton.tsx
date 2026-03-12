import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"

export function EtudiantEvaluationsButton() {
  return (
    <Button
      asChild
      className="
        h-20 px-8 gap-2
        text-black bg-white
        hover:bg-blue-400 hover:text-white
        transition font-semibold
      "
      variant="outline"
      size="lg"
    >
      <Link to="/mes-evaluations">
        <BookOpen className="size-5" />
        Mes Évaluations
      </Link>
    </Button>
  )
}
