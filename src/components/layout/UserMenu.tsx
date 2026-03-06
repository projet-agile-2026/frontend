import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
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
import { getCurrentUser, type UserInfo } from "@/services/authService"


const DEFAULT_USER_NAME = "Achraf El Aidi Idrissi"

interface UserMenuProps {
  userName?: string
}

export function UserMenu({ userName = DEFAULT_USER_NAME }: UserMenuProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) {
    navigate("/login")
    return
  }

  getCurrentUser()
    .then(setUser)
    .catch(() => {
      logout()
      navigate("/login")
    })
}, [])

  
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "ADM":
        return "Administrateur"
      case "ENS":
        return "Enseignant"
      case "ETU":
        return "Étudiant"
      default:
        return role
    }
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
          {user
            ? user.prenom && user.nom
              ? `${user.prenom} ${user.nom}`
              : user.email
            : "Chargement..."}
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
        <div className="px-3 py-2 text-xs text-slate-400">
          {user?.email}
        </div>

        <div className="px-3 py-1 text-xs font-bold text-yellow-600 uppercase">
          {user && formatRole(user.role)}
        </div>
      

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
