import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  type PromotionResponseDTO,
  type PromotionCreateUpdateDTO,
} from "../../services/promotionsService"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Loader2, AlertCircle, Plus, Pencil, Trash2, GraduationCap } from "lucide-react"
import { toast } from "sonner"

export function PromotionsPage() {
  const navigate = useNavigate()

  const [promotions, setPromotions] = useState<PromotionResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<PromotionResponseDTO | null>(null)
  const [formValues, setFormValues] = useState<PromotionCreateUpdateDTO>({
    codeFormation: "",
    anneeUniversitaire: "",
    nbMaxEtudiant: 0,
    siglePromotion: "",
    noEnseignant: undefined,
    dateRentree: "",
    lieuRentree: "",
    processusStage: "",
    commentaire: "",
    dateReponseLp: "",
    dateReponseLalp: "",
  })
  const [saving, setSaving] = useState(false)

  const loadPromotions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPromotions()
      setPromotions(data)
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des promotions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const filteredPromotions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return promotions
    return promotions.filter((p) => {
      const haystack = [
        p.codeFormation,
        p.anneeUniversitaire,
        p.diplome,
        p.nomFormation,
        p.enseignantNom,
        p.enseignantPrenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [promotions, search])

  const openCreate = () => {
    setEditingPromotion(null)
    setFormValues({
      codeFormation: "",
      anneeUniversitaire: "",
      nbMaxEtudiant: 0,
      siglePromotion: "",
      noEnseignant: undefined,
      dateRentree: "",
      lieuRentree: "",
      processusStage: "",
      commentaire: "",
      dateReponseLp: "",
      dateReponseLalp: "",
    })
    setFormOpen(true)
  }

  const openEdit = (promotion: PromotionResponseDTO) => {
    setEditingPromotion(promotion)
    setFormValues({
      codeFormation: promotion.codeFormation,
      anneeUniversitaire: promotion.anneeUniversitaire,
      nbMaxEtudiant: promotion.nbMaxEtudiant,
      siglePromotion: promotion.siglePromotion ?? "",
      noEnseignant: promotion.noEnseignant,
      dateRentree: promotion.dateRentree ?? "",
      lieuRentree: promotion.lieuRentree ?? "",
      processusStage: promotion.processusStage ?? "",
      commentaire: promotion.commentaire ?? "",
      dateReponseLp: promotion.dateReponseLp ?? "",
      dateReponseLalp: promotion.dateReponseLalp ?? "",
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!formValues.codeFormation || !formValues.anneeUniversitaire) {
      toast.error("Champs obligatoires manquants", {
        description: "Code formation et année universitaire sont requis.",
      })
      return
    }
    if (!formValues.nbMaxEtudiant || formValues.nbMaxEtudiant <= 0) {
      toast.error("Nombre maximal d'étudiants invalide")
      return
    }
    setSaving(true)
    try {
      if (editingPromotion) {
        await updatePromotion(
          editingPromotion.codeFormation,
          editingPromotion.anneeUniversitaire,
          formValues,
        )
        toast.success("Promotion mise à jour")
      } else {
        await createPromotion(formValues)
        toast.success("Promotion créée")
      }
      setFormOpen(false)
      await loadPromotions()
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message || "Impossible d'enregistrer la promotion.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (promotion: PromotionResponseDTO) => {
    const confirmed = window.confirm(
      `Supprimer la promotion ${promotion.codeFormation} - ${promotion.anneeUniversitaire} ?`,
    )
    if (!confirmed) return
    try {
      await deletePromotion(promotion.codeFormation, promotion.anneeUniversitaire)
      toast.success("Promotion supprimée")
      await loadPromotions()
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message || "Impossible de supprimer la promotion.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des promotions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={loadPromotions}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-gray-700" />
            Promotions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Gestion des promotions et de leur capacité d&apos;accueil.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Rechercher (code, formation, enseignant...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10"
            />
          </div>
          <Button
            type="button"
            className="h-10 rounded-xl bg-black px-4 sm:px-5 font-semibold text-white shadow hover:bg-black/90 w-full sm:w-auto"
            onClick={openCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle promotion
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-3 sm:px-4 py-3 border-b border-gray-200">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Liste des promotions{" "}
            <span className="text-gray-400 font-normal">
              ({filteredPromotions.length} résultat
              {filteredPromotions.length > 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-left">Code formation</th>
                  <th className="px-4 py-3 text-left">Année universitaire</th>
                  <th className="px-4 py-3 text-left">Diplôme</th>
                  <th className="px-4 py-3 text-left">Enseignant</th>
                  <th className="px-4 py-3 text-left">Nb max étudiants</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      Aucune promotion trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <tr
                      key={`${promotion.codeFormation}-${promotion.anneeUniversitaire}`}
                      className="hover:bg-gray-50/70"
                    >
                      <td
                        className="px-4 py-3 cursor-pointer text-blue-700 hover:underline"
                        onClick={() =>
                          navigate(
                            `/promotions/${promotion.codeFormation}/${promotion.anneeUniversitaire}`,
                          )
                        }
                      >
                        {promotion.codeFormation}
                      </td>
                      <td className="px-4 py-3">
                        {promotion.anneeUniversitaire}
                      </td>
                      <td className="px-4 py-3">
                        {promotion.diplome || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {promotion.enseignantNom
                          ? `${promotion.enseignantPrenom ?? ""} ${
                              promotion.enseignantNom
                            }`.trim()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {promotion.nbMaxEtudiant}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(promotion)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(promotion)}
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
            {filteredPromotions.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Aucune promotion trouvée.
              </div>
            ) : (
              filteredPromotions.map((promotion) => (
                <div
                  key={`${promotion.codeFormation}-${promotion.anneeUniversitaire}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="min-w-0 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/promotions/${promotion.codeFormation}/${promotion.anneeUniversitaire}`,
                        )
                      }
                    >
                      <div className="font-semibold text-gray-900">
                        {promotion.codeFormation} ·{" "}
                        {promotion.anneeUniversitaire}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {promotion.nomFormation || promotion.diplome || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Enseignant :{" "}
                        {promotion.enseignantNom
                          ? `${promotion.enseignantPrenom ?? ""} ${
                              promotion.enseignantNom
                            }`.trim()
                          : "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Nb max étudiants : {promotion.nbMaxEtudiant}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => openEdit(promotion)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(promotion)}
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

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Modifier la promotion" : "Nouvelle promotion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Code formation
                </label>
                <Input
                  value={formValues.codeFormation}
                  disabled={!!editingPromotion}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      codeFormation: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Année universitaire
                </label>
                <Input
                  placeholder="2024-2025"
                  value={formValues.anneeUniversitaire}
                  disabled={!!editingPromotion}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      anneeUniversitaire: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sigle promotion
                </label>
                <Input
                  value={formValues.siglePromotion ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      siglePromotion: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Numéro enseignant (responsable)
                </label>
                <Input
                  type="number"
                  value={formValues.noEnseignant ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      noEnseignant: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nb max étudiants
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formValues.nbMaxEtudiant}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      nbMaxEtudiant: Number(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lieu de rentrée
                </label>
                <Input
                  value={formValues.lieuRentree ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      lieuRentree: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date de rentrée
                </label>
                <Input
                  type="date"
                  value={formValues.dateRentree ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      dateRentree: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date réponse LP
                </label>
                <Input
                  type="date"
                  value={formValues.dateReponseLp ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      dateReponseLp: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date réponse LALP
                </label>
                <Input
                  type="date"
                  value={formValues.dateReponseLalp ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      dateReponseLalp: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Processus de stage
              </label>
              <Input
                value={formValues.processusStage ?? ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    processusStage: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Commentaire
              </label>
              <Input
                value={formValues.commentaire ?? ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    commentaire: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
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

