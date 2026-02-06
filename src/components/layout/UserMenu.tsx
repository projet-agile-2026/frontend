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
import { logout } from "@/services/authService"

const DEFAULT_USER_NAME = "Achraf El Aidi Idrissi"

interface UserMenuProps {
  userName?: string
}

export function UserMenu({ userName = DEFAULT_USER_NAME }: UserMenuProps) {
  const navigate = useNavigate()

  
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

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
          variant="ghost"
          size="lg"
        >
          <User className="size-5" />
          {userName}
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
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100">
          Mon compte
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100">
          Changer mot de passe
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="py-2 cursor-pointer text-red-600 hover:bg-red-50"
        >
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
