import { Outlet } from "react-router-dom"
import { Topbar } from "./Topbar"

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Topbar />
      <main className="flex-1 w-full min-w-0 px-4 py-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
