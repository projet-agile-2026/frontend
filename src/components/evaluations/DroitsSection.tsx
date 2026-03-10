import { useEffect, useState } from "react"
import { Share2, Plus, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog"

import {
    getDroits,
    upsertDroit,
    deleteDroit,
    type DroitResponseDTO,
    type DroitRequestDTO,
} from "../../services/EvaluationService"

interface DroitsSectionProps {
    evaluationId: number
}

function getTeacherFullName(droit: DroitResponseDTO | null): string {
    if (!droit) return ""
    return [droit.prenom, droit.nom].filter(Boolean).join(" ")
}

export function DroitsSection({ evaluationId }: DroitsSectionProps) {
    const [droits, setDroits] = useState<DroitResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [upsertOpen, setUpsertOpen] = useState(false)
    const [editingDroit, setEditingDroit] = useState<DroitResponseDTO | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DroitResponseDTO | null>(null)

    const [noEnseignant, setNoEnseignant] = useState<string>("")
    const [consultation, setConsultation] = useState(true)
    const [duplication, setDuplication] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const loadDroits = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getDroits(evaluationId)
            setDroits(Array.isArray(data) ? data : [])
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Erreur lors du chargement des droits."
            setError(message)
            toast.error("Erreur", {
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadDroits()
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
        const num = Number(noEnseignant)

        if (!num) {
            toast.error("Enseignant manquant", {
                description: "Veuillez sélectionner un enseignant.",
            })
            return
        }

        setSubmitting(true)

        try {
            const payload: DroitRequestDTO = {
                noEnseignant: num,
                consultation: consultation || duplication,
                duplication,
            }

            await upsertDroit(evaluationId, payload)
            await loadDroits()
            setUpsertOpen(false)

            toast.success(
                editingDroit ? "Droit modifié avec succès" : "Droit ajouté avec succès"
            )
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Erreur lors de l'enregistrement."
            setError(message)
            toast.error("Erreur", {
                description: message,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = (droit: DroitResponseDTO) => {
        setDeleteTarget(droit)
    }

    const editingTeacherName = getTeacherFullName(editingDroit)
    const deleteTeacherName = getTeacherFullName(deleteTarget)

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-0 pb-4">
                <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Gestion des droits</CardTitle>
                </div>

                <Button size="sm" className="gap-2" onClick={() => openUpsert()}>
                    <Plus className="h-4 w-4" />
                    Ajouter un droit
                </Button>
            </CardHeader>

            <CardContent className="px-0">
                {loading && (
                    <div className="py-10 text-center text-gray-500">Chargement...</div>
                )}

                {error && !loading && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && droits.length === 0 && (
                    <div className="text-sm text-gray-500">Aucun droit défini</div>
                )}

                {!loading && droits.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-sm">
                            <thead>
                            <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <th className="w-[45%] px-6 py-4">Enseignant</th>
                                <th className="w-[18%] px-6 py-4">Consultation</th>
                                <th className="w-[18%] px-6 py-4">Duplication</th>
                                <th className="w-[19%] px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {droits.map((d) => (
                                <tr key={d.noEnseignant} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {[d.prenom, d.nom].filter(Boolean).join(" ")}
                        </span>

                                            {d.emailUbo && (
                                                <span className="text-xs text-gray-500">
                            {d.emailUbo}
                          </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                      <span
                          className={
                              d.consultation === "O"
                                  ? "font-medium text-green-600"
                                  : "text-gray-400"
                          }
                      >
                        {d.consultation === "O" ? "Oui" : "Non"}
                      </span>
                                    </td>

                                    <td className="px-6 py-5">
                      <span
                          className={
                              d.duplication === "O"
                                  ? "font-medium text-green-600"
                                  : "text-gray-400"
                          }
                      >
                        {d.duplication === "O" ? "Oui" : "Non"}
                      </span>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openUpsert(d)}
                                                title="Modifier"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(d)}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>

            <Dialog open={upsertOpen} onOpenChange={setUpsertOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDroit
                                ? `Modifier le droit de ${editingTeacherName}`
                                : "Ajouter un droit"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {!editingDroit && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Enseignant
                                </label>

                                <Select value={noEnseignant} onValueChange={setNoEnseignant}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un enseignant" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {droits.map((d) => (
                                            <SelectItem
                                                key={d.noEnseignant}
                                                value={String(d.noEnseignant)}
                                            >
                                                {[d.prenom, d.nom].filter(Boolean).join(" ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={consultation || duplication}
                                disabled={duplication}
                                onChange={(e) => setConsultation(e.target.checked)}
                            />
                            Consultation
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={duplication}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setDuplication(checked)
                                    if (checked) {
                                        setConsultation(true)
                                    }
                                }}
                            />
                            Duplication
                        </label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpsertOpen(false)}>
                            Annuler
                        </Button>

                        <Button onClick={handleUpsert} disabled={submitting}>
                            {submitting ? "En cours..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteTarget != null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce droit</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Voulez-vous vraiment supprimer le droit de ${deleteTeacherName} ?`
                                : "Voulez-vous vraiment supprimer ce droit ?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>

                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={async () => {
                                if (!deleteTarget) return

                                try {
                                    await deleteDroit(evaluationId, deleteTarget.noEnseignant)
                                    await loadDroits()
                                    toast.success("Droit supprimé avec succès")
                                } catch (e: unknown) {
                                    const message =
                                        e instanceof Error
                                            ? e.message
                                            : "Erreur lors de la suppression."
                                    setError(message)
                                    toast.error("Erreur", {
                                        description: message,
                                    })
                                } finally {
                                    setDeleteTarget(null)
                                }
                            }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}