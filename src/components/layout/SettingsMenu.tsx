import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Link } from "react-router-dom"

export function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="
            h-20 px-8 gap-2
            text-black bg-white
            hover:bg-yellow-400 hover:text-black
            transition font-semibold
          "
          variant="outline"
          size="lg"
        >
          <Settings className="size-5" />
          Réglage de SPI
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          min-w-[240px]
          border-yellow-400
          shadow-lg
        "
      >
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/couples"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion couples qualificatif
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/questions"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion questions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/rubriques"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion rubriques
          </Link>
        </DropdownMenuItem> 
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
