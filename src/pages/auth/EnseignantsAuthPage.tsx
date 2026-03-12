import { useEffect, useMemo, useState } from "react"
import {
  getEnseignantsAuth,
  toggleUserAuth,
  type AdminUserDTO
} from "../../services/adminAuthService"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Button } from "../../components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"

import { Loader2, UserCheck } from "lucide-react"
import { toast } from "sonner"

export function EnseignantsAuthPage() {
  const [users, setUsers] = useState<AdminUserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [userToConfirm, setUserToConfirm] = useState<AdminUserDTO | null>(null)
  const [saving, setSaving] = useState(false)

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getEnseignantsAuth()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((u) =>
      `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
    )
  }, [users, search])

  function openConfirm(user: AdminUserDTO) {
    setUserToConfirm(user)
  }

  function closeConfirm() {
    if (!saving) setUserToConfirm(null)
  }

  async function confirmToggle() {
    if (!userToConfirm) return

    try {
      setSaving(true)
      await toggleUserAuth(userToConfirm.authId)

      setUsers((prev) =>
        prev.map((u) =>
          u.authId === userToConfirm.authId
            ? { ...u, active: !u.active }
            : u
        )
      )

      toast.success(
        userToConfirm.active ? "Connexion désactivée" : "Connexion activée"
      )

      setUserToConfirm(null)
    } catch {
      toast.error("Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <UserCheck className="h-6 w-6" />
            Gestion des connexions enseignants
          </h1>
          <p className="text-sm text-gray-500">
            Autoriser ou refuser l'accès à la plateforme.
          </p>
        </div>

        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enseignants ({filteredUsers.length})</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Prénom</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-center">Accès</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.authId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{user.nom}</td>
                  <td className="px-4 py-3">{user.prenom}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.telephone ?? "-"}</td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openConfirm(user)}
                      className="inline-flex items-center gap-2"
                    >
                      <Switch
                        checked={user.active}
                        className="pointer-events-none data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-300"
                      />
                      <span className="text-xs text-gray-600">
                        {user.active ? "Actif" : "Bloqué"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToConfirm} onOpenChange={(open) => !open && closeConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription>
              {userToConfirm && (
                <>
                  Êtes-vous sûr de vouloir{" "}
                  <span className="font-semibold">
                    {userToConfirm.active ? "désactiver" : "activer"}
                  </span>{" "}
                  l'accès de{" "}
                  <span className="font-semibold">
                    {userToConfirm.prenom} {userToConfirm.nom}
                  </span>{" "}
                  ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Annuler</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmToggle} disabled={saving}>
                {saving ? "Enregistrement..." : "Confirmer"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}