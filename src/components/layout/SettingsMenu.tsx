import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { getCurrentUser } from "@/services/authService"
import type { UserInfo } from "@/services/authService"
import { useState } from "react"

export function SettingsMenu() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
      getCurrentUser().then(setUser)
    }, [])

  const role = user?.role
  console.log("role", role)
  
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
          Paramétrage
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
        {role === "ADM" && 
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/couples"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion des Couples
          </Link>
        </DropdownMenuItem>
        }
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/questions"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion des Questions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 cursor-pointer hover:bg-yellow-100" asChild>
          <Link
            to="/rubriques"
            className="py-2 cursor-pointer hover:bg-yellow-100 w-full"
          >
            Gestion des Rubriques
          </Link>
        </DropdownMenuItem> 
      </DropdownMenuContent>
    </DropdownMenu>
  )
}