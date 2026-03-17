import { useEffect, useRef, useState } from "react"
import { Share2, Plus, Trash2, Pencil, ChevronDown } from "lucide-react"
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
import { getEnseignants, type EnseignantLightDTO } from "../../services/enseignantservice"
import { getCurrentUser } from "../../services/authService"

interface DroitsSectionProps {
    evaluationId: number
    evaluationDesignation?: string
}

function getTeacherFullName(droit: DroitResponseDTO | null): string {
    if (!droit) return ""
    return [droit.prenom, droit.nom].filter(Boolean).join(" ")
}

export function DroitsSection({ evaluationId, evaluationDesignation }: DroitsSectionProps) {
    const [droits, setDroits] = useState<DroitResponseDTO[]>([])
    const [enseignants, setEnseignants] = useState<EnseignantLightDTO[]>([])
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [upsertOpen, setUpsertOpen] = useState(false)
    const [editingDroit, setEditingDroit] = useState<DroitResponseDTO | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DroitResponseDTO | null>(null)

    const [noEnseignant, setNoEnseignant] = useState<string>("")
    const [selectedLabel, setSelectedLabel] = useState<string>("")
    const [duplication, setDuplication] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchEnseignant, setSearchEnseignant] = useState<string>("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

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
            toast.error("Erreur", { description: message })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadDroits()

        getCurrentUser()
            .then((u) => {
                getEnseignants()
                    .then((data) => {
                        const list = Array.isArray(data) ? data : []
                        setEnseignants(list)
                        console.log("LISTE ENSEIGNANTS API:", list)
                        const found = list.find(e => e.emailUbo === u?.email)
                        if (found) setCurrentUserId(found.noEnseignant)
                    })
                    .catch(() => {})
            })
            .catch(() => {})
    }, [evaluationId])

    // Fermer le dropdown si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const openUpsert = (droit?: DroitResponseDTO) => {
        setEditingDroit(droit ?? null)
        setSearchEnseignant("")
        setDropdownOpen(false)
        setNoEnseignant("")
        setSelectedLabel("")

        if (droit) {
            setNoEnseignant(String(droit.noEnseignant))
            setDuplication(droit.duplication === "O")
        } else {
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
                consultation: true,
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
            toast.error("Erreur", { description: message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = (droit: DroitResponseDTO) => {
        setDeleteTarget(droit)
    }

    const editingTeacherName = getTeacherFullName(editingDroit)
    const deleteTeacherName = getTeacherFullName(deleteTarget)
    console.log("enseignant", enseignants)

    // Liste triée alphabétiquement par NOM, filtrée par recherche,
    // en excluant ceux qui ont déjà un droit et l'enseignant connecté
    const filteredEnseignants = enseignants
        .filter(e =>
            !droits.some(d => d.noEnseignant === e.noEnseignant) &&
            e.noEnseignant !== currentUserId
        )
        .sort((a, b) =>
            `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
        )
        .filter(e =>
            `${e.nom} ${e.prenom}`.toLowerCase().includes(searchEnseignant.toLowerCase())
        )


        console.log("droits:", droits)
console.log("enseignants:", enseignants)
console.log("currentUserId:", currentUserId)
console.log("filteredEnseignants:", filteredEnseignants)
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-0 pb-4">
                <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-gray-600" />
                    <div>
                        <CardTitle className="text-lg">Gestion des droits</CardTitle>
                        {evaluationDesignation && (
                            <p className="text-sm text-gray-500 mt-0.5">{evaluationDesignation}</p>
                        )}
                    </div>
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
                                                <span className="text-xs text-gray-500">{d.emailUbo}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className={d.consultation === "O" ? "font-medium text-green-600" : "text-gray-400"}>
                                            {d.consultation === "O" ? "Oui" : "Non"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className={d.duplication === "O" ? "font-medium text-green-600" : "text-gray-400"}>
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

                                {/* Dropdown custom — évite le bug de repositionnement du SelectContent shadcn */}
                                <div className="relative" ref={dropdownRef}>
                                    {/* Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(prev => !prev)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
                                            {selectedLabel || "Choisir un enseignant"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>

                                    {/* Liste déroulante fixe */}
                                    {dropdownOpen && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                            {/* Barre de recherche */}
                                            <div className="p-2 border-b border-gray-100">
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un enseignant..."
                                                    value={searchEnseignant}
                                                    onChange={(e) => setSearchEnseignant(e.target.value)}
                                                    className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-gray-400"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Liste avec scroll fixe */}
                                            <ul className="max-h-48 overflow-y-auto py-1">
                                                {filteredEnseignants.length === 0 ? (
                                                    <li className="px-3 py-2 text-sm text-gray-400">
                                                        Aucun enseignant trouvé
                                                    </li>
                                                ) : (
                                                    filteredEnseignants.map((e) => {
                                                        const label = [e.nom, e.prenom].filter(Boolean).join(" ")
                                                        return (
                                                            <li
                                                                key={e.noEnseignant}
                                                                onClick={() => {
                                                                    setNoEnseignant(String(e.noEnseignant))
                                                                    setSelectedLabel(label)
                                                                    setDropdownOpen(false)
                                                                    setSearchEnseignant("")
                                                                }}
                                                                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                                                                    noEnseignant === String(e.noEnseignant)
                                                                        ? "bg-gray-50 font-medium"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {label}
                                                            </li>
                                                        )
                                                    })
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={true} disabled readOnly />
                            Consultation
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={duplication}
                                onChange={(e) => setDuplication(e.target.checked)}
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
                                    toast.error("Erreur", { description: message })
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