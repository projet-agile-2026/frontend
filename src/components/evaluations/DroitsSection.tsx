import { useEffect, useState } from "react"
import { Shield, Plus, Trash2, Pencil, Users } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  getDroits,
  upsertDroit,
  deleteDroit,
  donnerDroitATous,
  type DroitResponseDTO,
  type DroitRequestDTO,
  type DroitTousRequestDTO,
} from "../../services/EvaluationService"
import {
  getEnseignants,
  type EnseignantLightDTO,
} from "../../services/enseignantservice"

interface DroitsSectionProps {
  evaluationId: number
}

export function DroitsSection({ evaluationId }: DroitsSectionProps) {
  const [droits, setDroits] = useState<DroitResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [upsertOpen, setUpsertOpen] = useState(false)
  const [tousOpen, setTousOpen] = useState(false)
  const [editingDroit, setEditingDroit] = useState<DroitResponseDTO | null>(null)

  const [noEnseignant, setNoEnseignant] = useState<string>("")
  const [consultation, setConsultation] = useState(true)
  const [duplication, setDuplication] = useState(false)
  const [tousConsultation, setTousConsultation] = useState(true)
  const [tousDuplication, setTousDuplication] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enseignants, setEnseignants] = useState<EnseignantLightDTO[]>([])
  const [loadingEnseignants, setLoadingEnseignants] = useState(false)

  const loadDroits = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDroits(evaluationId)
      setDroits(data)
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des droits.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDroits()
  }, [evaluationId])

  const openUpsert = (droit?: DroitResponseDTO) => {
    setEditingDroit(droit ?? null)
    if (droit) {
      setNoEnseignant(String(droit.noEnseignant))
      setConsultation(droit.consultation === "O")
      setDuplication(droit.duplication === "O")
    } else {
      setNoEnseignant("")
      setConsultation(true)
      setDuplication(false)
    }
    setUpsertOpen(true)
  }

  const handleUpsert = async () => {
    const num = noEnseignant.trim() ? Number(noEnseignant) : NaN
    if (Number.isNaN(num) || num < 0) {
      return
    }
    setSubmitting(true)
    try {
      const payload: DroitRequestDTO = {
        noEnseignant: num,
        consultation,
        duplication,
      }
      await upsertDroit(evaluationId, payload)
      await loadDroits()
      setUpsertOpen(false)
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (noEnseignantCible: number) => {
    if (!window.confirm("Retirer l'accès pour cet enseignant ?")) return
    try {
      await deleteDroit(evaluationId, noEnseignantCible)
      await loadDroits()
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression.")
    }
  }

  const handleDonnerATous = async () => {
    setSubmitting(true)
    try {
      const payload: DroitTousRequestDTO = {
        consultation: tousConsultation,
        duplication: tousDuplication,
      }
      await donnerDroitATous(evaluationId, payload)
      await loadDroits()
      setTousOpen(false)
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'octroi des droits.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!upsertOpen || enseignants.length > 0) return
    const load = async () => {
      try {
        setLoadingEnseignants(true)
        const data = await getEnseignants()
        setEnseignants(data)
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des enseignants.")
      } finally {
        setLoadingEnseignants(false)
      }
    }
    void load()
  }, [upsertOpen, enseignants.length])

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-base font-semibold text-gray-900">
              Gestion des droits
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={tousOpen} onOpenChange={setTousOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  Donner droit à tous
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Droit à tous les enseignants</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tousConsultation}
                      onChange={(e) => setTousConsultation(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Consultation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tousDuplication}
                      onChange={(e) => setTousDuplication(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Duplication</span>
                  </label>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTousOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDonnerATous}
                    disabled={submitting}
                  >
                    {submitting ? "En cours…" : "Appliquer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={upsertOpen} onOpenChange={setUpsertOpen}>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  openUpsert()
                  setUpsertOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Ajouter un droit
              </Button>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>
                    {editingDroit ? "Modifier le droit" : "Ajouter un droit"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enseignant
                    </label>
                    <div className="mt-1">
                      <Select
                        value={noEnseignant || undefined}
                        onValueChange={setNoEnseignant}
                        disabled={!!editingDroit || loadingEnseignants}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              loadingEnseignants
                                ? "Chargement..."
                                : "Sélectionner un enseignant"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {enseignants.map((e) => (
                            <SelectItem
                              key={e.noEnseignant}
                              value={String(e.noEnseignant)}
                            >
                              {e.prenom} {e.nom} ({e.emailUbo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consultation}
                      onChange={(e) => setConsultation(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Consultation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={duplication}
                      onChange={(e) => setDuplication(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Duplication</span>
                  </label>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUpsertOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpsert}
                    disabled={submitting || (noEnseignant.trim() === "" && !editingDroit)}
                  >
                    {submitting ? "En cours…" : editingDroit ? "Enregistrer" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="mx-4 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            Chargement des droits…
          </div>
        ) : droits.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-200 bg-gray-50/50 mx-4 my-4 px-4 py-6 text-center text-sm text-gray-500">
            Aucun droit spécifique. Utilisez &laquo; Donner droit à tous &raquo; ou &laquo; Ajouter un droit &raquo;.
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-semibold uppercase text-gray-500">
                    <th className="px-4 py-3">Enseignant</th>
                    <th className="px-4 py-3">Consultation</th>
                    <th className="px-4 py-3">Duplication</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {droits.map((d) => (
                    <tr
                      key={d.noEnseignant}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {d.noEnseignant}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            d.consultation === "O"
                              ? "text-green-600 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {d.consultation === "O" ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            d.duplication === "O"
                              ? "text-green-600 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {d.duplication === "O" ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            onClick={() => {
                              openUpsert(d)
                              setUpsertOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => handleDelete(d.noEnseignant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-2 p-4">
              {droits.map((d) => (
                <div
                  key={d.noEnseignant}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">{d.noEnseignant}</span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          openUpsert(d)
                          setUpsertOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(d.noEnseignant)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-3 text-xs text-gray-600">
                    <span>Consultation: {d.consultation === "O" ? "Oui" : "Non"}</span>
                    <span>Duplication: {d.duplication === "O" ? "Oui" : "Non"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
