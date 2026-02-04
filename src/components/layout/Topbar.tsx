import { SettingsMenu } from "./SettingsMenu"
import { UserMenu } from "./UserMenu"

const APP_TITLE = "Plateforme d'évaluation"

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-4">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{APP_TITLE}</h1>
        <div className="flex items-center gap-2">
          <SettingsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
