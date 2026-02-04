import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="size-4" />
          Réglage de SPI
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Gestion UE</DropdownMenuItem>
        <DropdownMenuItem>Gestion questions</DropdownMenuItem>
        <DropdownMenuItem>Gestion campagnes</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
