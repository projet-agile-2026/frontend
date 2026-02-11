import { Outlet } from "react-router-dom"
import { Topbar } from "./Topbar"

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
