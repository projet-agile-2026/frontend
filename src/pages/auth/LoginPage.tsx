import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { login } from "@/services/authService"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    global?: string
  }>({})


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = "Email requis"
    }

    if (!password) {
      newErrors.password = "Mot de passe requis"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await login({
        email,
        motPasse: password,
      })

      localStorage.setItem("token", res.token)
      navigate("/")
    } catch (error: any) {

      const message =
        error?.message || "Email ou mot de passe incorrect" 

      setErrors({
        email: undefined,
        password: undefined,
        global: message
      })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/")
    }
  }, [])


  const now = new Date().toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/public/ubo-bg.jpg')", // 👉 mets ton image dans /public/ubo-bg.jpg
      }}
    >
      <Card className="w-[470px] p-10 shadow-xl">
        {/* HEADER */}
        <div className="mb-4">
          <img
            src="/logo_UBO.png"
            alt="Université de Bretagne Occidentale"
            className="h-16 mb-3"
          />
          <p className="text-sm">{now}</p>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email:*</label>
            <Input

              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors({})
              }}
              className={`bg-yellow-100 border-yellow-400 focus-visible:ring-yellow-400 ${errors.email ? "border-red-500" : ""
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Password:*</label>
            <div className="flex">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
  setPassword(e.target.value)
  setErrors({})
}}
                className="bg-yellow-100 border-yellow-400 rounded-r-none focus-visible:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="bg-yellow-400 px-3 flex items-center rounded-r-md"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {errors.global && (
            <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
              {errors.global}
            </div>
          )}
          <Button
            type="submit"
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            LOGIN
          </Button>
        </form>

        <hr className="my-4" />

        <div className="mt-4 space-y-2 text-[13px] leading-relaxed text-gray-600">
          <p className="text-xs">
            Ne complétez jamais ce formulaire si l'adresse n'est pas{" "}
            <a
              href="https://cas.univ-brest.fr"
              className="text-blue-600 hover:underline"
            >
              https://cas.univ-brest.fr
            </a>
            . En cas de doute, contactez{" "}
            <a href="#" className="text-blue-600 hover:underline">
              l’assistance informatique
            </a>
            .
          </p>

          <p>
            Déconnectez-vous et fermez votre navigateur lorsque vous avez fini
            d'accéder aux services authentifiés.
          </p>
        </div>

      </Card>
    </div>
  )
}
