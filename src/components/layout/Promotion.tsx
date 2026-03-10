import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Link } from "react-router-dom"

export function Promotion() {
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
      <Link to="/promotions">
        <Settings className="size-5" />
        Gestion des promotions
      </Link>
    </Button>
  )
}
