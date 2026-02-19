import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { Toaster } from "./components/ui/sonner"
import { GlobalApiErrorListener } from "./components/GlobalApiErrorListener"

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalApiErrorListener />
      <Toaster />
    </>
  )
}

export default App
