import { SettingsMenu } from "./SettingsMenu"
import { UserMenu } from "./UserMenu"
import { Link } from "react-router-dom"
import { EvaluationsButton } from "./EvaluationsButton"
import { EtudiantEvaluationsButton } from "./EtudiantEvaluationsButton"
import { Promotion } from "./Promotion"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../../services/authService"


const APP_TITLE = "Plateforme d'évaluation"

export function Topbar() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then(user => setUserRole(user.role))
      .catch(() => setUserRole(null))
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 md:px-8 min-h-[4rem] sm:min-h-[5.5rem]">
        {/* LEFT : LOGO + BADGES + TITLE */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1">
          <Link to="/" className="flex-shrink-0">
            <img
              src="/logo_UBO.png"
              alt="UBO"
              className="h-12 sm:h-16 md:h-20 cursor-pointer hover:opacity-80 transition"
            />
          </Link>

          <div className="hidden sm:flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img
              src="/logo-ubo-villes.svg"
              alt="UBO villes"
              className="h-12 md:h-20"
            />
            <img
              src="/logo-sea-eu.svg"
              alt="SEA-EU"
              className="h-12 md:h-20"
            />
            <img
              src="/oceanography.svg"
              alt="Oceanography"
              className="h-12 md:h-20"
            />
          </div>

          <span className="text-xl sm:text-2xl md:text-4xl xl:text-5xl font-extrabold tracking-wide text-black truncate ml-0 sm:ml-2 md:ml-4">
            {APP_TITLE}
          </span>
        </div>

        {/* RIGHT : MENUS */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <Promotion />
          {userRole === "ETU" ? <EtudiantEvaluationsButton /> : <EvaluationsButton />}
          <SettingsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
