import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertCircle, Loader2, Plus, Pencil, Trash2, User } from "lucide-react"
import {
  getPromotion,
  type PromotionResponseDTO,
} from "../../services/promotionsService"
import {
  getEtudiantsByPromotion,
  addEtudiantToPromotion,
  updateEtudiant,
  deleteEtudiant,
  type EtudiantResponseDTO,
  type EtudiantRequestDTO,
} from "../../services/etudiantsService"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { toast } from "sonner"

export function PromotionDetailPage() {
  const navigate = useNavigate()
  const { codeFormation, anneeUniversitaire } = useParams<{
    codeFormation: string
    anneeUniversitaire: string
  }>()

  const [promotion, setPromotion] = useState<PromotionResponseDTO | null>(null)
  const [etudiants, setEtudiants] = useState<EtudiantResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [etudiantDialogOpen, setEtudiantDialogOpen] = useState(false)
  const [editingEtudiant, setEditingEtudiant] = useState<EtudiantResponseDTO | null>(null)
  const [etudiantForm, setEtudiantForm] = useState<EtudiantRequestDTO>({
    nom: "",
    prenom: "",
    sexe: "M",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "",
    telephone: "",
    mobile: "",
    email: "",
    emailUbo: "",
    adresse: "",
    codePostal: "",
    ville: "",
    paysOrigine: "",
    universiteOrigine: "",
    groupeTp: undefined,
    groupeAnglais: undefined,
  })
  const [savingEtudiant, setSavingEtudiant] = useState(false)

  const loadData = async () => {
    if (!codeFormation || !anneeUniversitaire) return
    try {
      setLoading(true)
      setError(null)
      const [promo, etuds] = await Promise.all([
        getPromotion(codeFormation, anneeUniversitaire),
        getEtudiantsByPromotion(codeFormation, anneeUniversitaire),
      ])
      setPromotion(promo)
      setEtudiants(etuds)
    } catch (e: any) {
      setError(
        e.message ||
          "Erreur lors du chargement de la promotion et des étudiants.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [codeFormation, anneeUniversitaire])

  const openAddEtudiant = () => {
    setEditingEtudiant(null)
    setEtudiantForm({
      nom: "",
      prenom: "",
      sexe: "M",
      dateNaissance: "",
      lieuNaissance: "",
      nationalite: "",
      telephone: "",
      mobile: "",
      email: "",
      emailUbo: "",
      adresse: "",
      codePostal: "",
      ville: "",
      paysOrigine: "",
      universiteOrigine: "",
      groupeTp: undefined,
      groupeAnglais: undefined,
    })
    setEtudiantDialogOpen(true)
  }

  const openEditEtudiant = (etudiant: EtudiantResponseDTO) => {
    setEditingEtudiant(etudiant)
    setEtudiantForm({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      sexe: etudiant.sexe,
      dateNaissance: etudiant.dateNaissance.slice(0, 10),
      lieuNaissance: etudiant.lieuNaissance,
      nationalite: etudiant.nationalite,
      telephone: etudiant.telephone,
      mobile: etudiant.mobile,
      email: etudiant.email,
      emailUbo: etudiant.emailUbo,
      adresse: etudiant.adresse,
      codePostal: etudiant.codePostal,
      ville: etudiant.ville,
      paysOrigine: etudiant.paysOrigine,
      universiteOrigine: etudiant.universiteOrigine,
      groupeTp: etudiant.groupeTp,
      groupeAnglais: etudiant.groupeAnglais,
    })
    setEtudiantDialogOpen(true)
  }

  const handleSaveEtudiant = async () => {
    if (!codeFormation || !anneeUniversitaire) return
    if (!etudiantForm.nom || !etudiantForm.prenom || !etudiantForm.email) {
      toast.error("Champs obligatoires manquants", {
        description: "Nom, prénom et email sont requis.",
      })
      return
    }
    setSavingEtudiant(true)
    try {
      if (editingEtudiant) {
        await updateEtudiant(editingEtudiant.noEtudiant, etudiantForm)
        toast.success("Étudiant mis à jour")
      } else {
        await addEtudiantToPromotion(
          codeFormation,
          anneeUniversitaire,
          etudiantForm,
        )
        toast.success("Étudiant ajouté à la promotion")
      }
      setEtudiantDialogOpen(false)
      await loadData()
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message || "Impossible d'enregistrer l'étudiant.",
      })
    } finally {
      setSavingEtudiant(false)
    }
  }

  const handleDeleteEtudiant = async (etudiant: EtudiantResponseDTO) => {
    const confirmed = window.confirm(
      `Supprimer l'étudiant ${etudiant.prenom} ${etudiant.nom} ?`,
    )
    if (!confirmed) return
    try {
      await deleteEtudiant(etudiant.noEtudiant)
      toast.success("Étudiant supprimé")
      await loadData()
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message || "Impossible de supprimer l'étudiant.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement de la promotion...</p>
        </div>
      </div>
    )
  }

  if (error || !promotion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">
            {error || "Promotion introuvable."}
          </p>
          <Button onClick={() => navigate("/promotions")}>Retour</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {promotion.nomFormation || promotion.codeFormation}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Année universitaire {promotion.anneeUniversitaire}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/promotions")}
          className="w-full sm:w-auto"
        >
          Retour aux promotions
        </Button>
      </div>

      {/* Promotion info */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-6 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Informations promotion
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 sm:px-6 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <div className="text-xs uppercase text-gray-500">
                Code formation
              </div>
              <div className="font-medium text-gray-900">
                {promotion.codeFormation}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                Diplôme
              </div>
              <div className="font-medium text-gray-900">
                {promotion.diplome || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                Nombre max d&apos;étudiants
              </div>
              <div className="font-medium text-gray-900">
                {promotion.nbMaxEtudiant}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                Enseignant responsable
              </div>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                {promotion.enseignantNom
                  ? `${promotion.enseignantPrenom ?? ""} ${
                      promotion.enseignantNom
                    }`.trim()
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                Date de rentrée
              </div>
              <div className="font-medium text-gray-900">
                {promotion.dateRentree
                  ? new Date(promotion.dateRentree).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                Lieu de rentrée
              </div>
              <div className="font-medium text-gray-900">
                {promotion.lieuRentree || "-"}
              </div>
            </div>
          </div>
          {promotion.commentaire && (
            <div className="text-sm text-gray-700">
              <span className="font-medium text-gray-800">Commentaire : </span>
              {promotion.commentaire}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Étudiants list */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-6 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Étudiants de la promotion{" "}
            <span className="text-gray-400 font-normal">
              ({etudiants.length} étudiant{etudiants.length > 1 ? "s" : ""})
            </span>
          </CardTitle>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl bg-black text-white hover:bg-black/90 w-full sm:w-auto"
            onClick={openAddEtudiant}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un étudiant
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-left">N° étudiant</th>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Prénom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Université d&apos;origine</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {etudiants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      Aucun étudiant dans cette promotion.
                    </td>
                  </tr>
                ) : (
                  etudiants.map((etudiant) => (
                    <tr
                      key={etudiant.noEtudiant}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="px-4 py-3">{etudiant.noEtudiant}</td>
                      <td className="px-4 py-3">{etudiant.nom}</td>
                      <td className="px-4 py-3">{etudiant.prenom}</td>
                      <td className="px-4 py-3">{etudiant.email}</td>
                      <td className="px-4 py-3">
                        {etudiant.universiteOrigine}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditEtudiant(etudiant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteEtudiant(etudiant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden p-3 space-y-3">
            {etudiants.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Aucun étudiant dans cette promotion.
              </div>
            ) : (
              etudiants.map((etudiant) => (
                <div
                  key={etudiant.noEtudiant}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">
                        {etudiant.prenom} {etudiant.nom}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        N° étudiant : {etudiant.noEtudiant}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 break-all">
                        {etudiant.email}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {etudiant.universiteOrigine}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => openEditEtudiant(etudiant)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteEtudiant(etudiant)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Étudiant create/edit dialog */}
      <Dialog open={etudiantDialogOpen} onOpenChange={setEtudiantDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEtudiant ? "Modifier l'étudiant" : "Ajouter un étudiant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <Input
                  value={etudiantForm.nom}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      nom: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <Input
                  value={etudiantForm.prenom}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      prenom: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sexe (M/F)
                </label>
                <Input
                  maxLength={1}
                  value={etudiantForm.sexe}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      sexe: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <Input
                  type="date"
                  value={etudiantForm.dateNaissance}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      dateNaissance: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lieu de naissance
                </label>
                <Input
                  value={etudiantForm.lieuNaissance}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      lieuNaissance: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nationalité
                </label>
                <Input
                  value={etudiantForm.nationalite}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      nationalite: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={etudiantForm.email}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <Input
                  value={etudiantForm.adresse}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      adresse: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ville
                </label>
                <Input
                  value={etudiantForm.ville}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      ville: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pays d&apos;origine
                </label>
                <Input
                  value={etudiantForm.paysOrigine}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      paysOrigine: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Université d&apos;origine
                </label>
                <Input
                  value={etudiantForm.universiteOrigine}
                  onChange={(e) =>
                    setEtudiantForm((prev) => ({
                      ...prev,
                      universiteOrigine: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEtudiantDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveEtudiant}
              disabled={savingEtudiant}
              className="w-full sm:w-auto"
            >
              {savingEtudiant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

