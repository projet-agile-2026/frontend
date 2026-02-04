import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

const DEFAULT_USER_NAME = "Achraf El Aidi Idrissi"

interface UserMenuProps {
  userName?: string
}

export function UserMenu({ userName = DEFAULT_USER_NAME }: UserMenuProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Mock: no backend call
    navigate("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="size-4" />
          {userName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Mon compte</DropdownMenuItem>
        <DropdownMenuItem>Changer mot de passe</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
