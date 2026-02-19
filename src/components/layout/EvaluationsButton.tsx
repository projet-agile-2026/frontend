import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ClipboardList } from "lucide-react"

export function EvaluationsButton() {
  return (
    <Button
      asChild
      className="
        h-20 px-8 gap-2
        text-black bg-white
        hover:bg-yellow-400 hover:text-black
        transition font-semibold
      "
      variant="outline"
      size="lg"
    >
      <Link to="/evaluations">
        <ClipboardList className="size-5" />
        Évaluations
      </Link>
    </Button>
  )
}
