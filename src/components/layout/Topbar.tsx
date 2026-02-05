import { SettingsMenu } from "./SettingsMenu"
import { UserMenu } from "./UserMenu"

const APP_TITLE = "Plateforme d’évaluation"

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 h-30 bg-white">
      <div className="flex items-center justify-between px-8 h-34">
        
        {/* LEFT : LOGO + BADGES + TITLE */}
        <div className="flex items-center gap-6">
          {/* LOGO UBO */}
          <img
            src="/logo_UBO.png"
            alt="UBO"
            className="h-20"
          />

          {/* BADGES */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-ubo-villes.svg"
              alt="UBO villes"
              className="h-20"
            />
            <img
              src="/logo-sea-eu.svg"
              alt="SEA-EU"
              className="h-20"
            />
            <img
              src="/oceanography.svg"
              alt="Oceanography"
              className="h-20"
            />
          </div>

          {/* TITLE */}
          <span className="ml-4 text-5xl font-extrabold tracking-wide text-black">
            {APP_TITLE}
          </span>

        </div>

        {/* RIGHT : MENUS (UNCHANGED) */}
        <div className="flex items-center gap-3">
          <SettingsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
