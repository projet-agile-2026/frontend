import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  deleteEvaluation,
  dupliquerEvaluation,
  EvaluationListItem,
  getEvaluations,
  getEvaluationsPartagees,
} from "../../services/EvaluationService"
import { EvaluationFilters } from "../../components/evaluations/EvaluationFilters"
import { EvaluationsTable } from "../../components/evaluations/EvaluationsTable"
import { DroitsSection } from "../../components/evaluations/DroitsSection"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"
import { getCurrentUser, type UserInfo } from "../../services/authService"
import type { EvaluationStatus } from "../../services/EvaluationService"
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

export function EvaluationsPage() {
  const navigate = useNavigate()

  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("Evaluations:", evaluations)

  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"mine" | "partagees">("mine")
  const [academicYearFilter, setAcademicYearFilter] = useState<string | null>(
    null,
  )
  const [selectedStates, setSelectedStates] = useState<EvaluationStatus[]>([])
  const [droitsDialogEvaluationId, setDroitsDialogEvaluationId] = useState<
    number | null
  >(null)
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EvaluationListItem | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 10

  const isAdmin =
    user?.role === "ADM" || user?.role === "ADMIN"

  function getCurrentAcademicYear(date = new Date()) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // 1..12
    // Sept -> Déc : year-year+1 ; Jan -> Août : year-1-year
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`
  }

  function applyFilters(items: EvaluationListItem[]) {
    let out = items

    const term = search.trim().toLowerCase()
    if (term) {
      out = out.filter((e) => {
        const haystack = [
          e.anneeUniversitaire,
          e.codeFormation,
          e.libelleFormation,
          e.codeUe,
          e.libelleUe,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(term)
      })
    }

    if (academicYearFilter) {
      out = out.filter((e) => e.anneeUniversitaire === academicYearFilter)
    }

    if (selectedStates.length > 0) {
      out = out.filter((e) => selectedStates.includes(e.etat))
    }

    return out
  }

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)

      const data =
        viewMode === "partagees"
          ? await getEvaluationsPartagees()
          : await getEvaluations()

      setEvaluations(data)
    } catch (e: any) {
  if (e.status === 403) {
    navigate("/unauthorized", { replace: true })
    return
  }

  setError(e.message || "Erreur lors du chargement des évaluations.")
} finally {
  setLoading(false)
}

  }

  useEffect(() => {
    loadEvaluations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  useEffect(() => {
    // Minimal user fetch for role-based UI
    getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [])

  const filteredEvaluations = useMemo(
    () => applyFilters(evaluations),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [evaluations, search, academicYearFilter, selectedStates],
  )

  const paginatedEvaluations = useMemo(() => {
    if (!Array.isArray(filteredEvaluations)) return []
    const start = (page - 1) * pageSize
    return filteredEvaluations.slice(start, start + pageSize)
  }, [filteredEvaluations, page])

  useEffect(() => {
    setPage(1)
  }, [search, academicYearFilter, selectedStates])

  const handleDelete = async (evaluation: EvaluationListItem) => {
    setDeleteTarget(evaluation)
  }

  const handleDuplicate = async (evaluation: EvaluationListItem) => {
    setDuplicatingId(evaluation.idEvaluation)
    try {
      const created = await dupliquerEvaluation(evaluation.idEvaluation)
      toast.success("Évaluation dupliquée")
      await loadEvaluations()
      if (created?.id != null) {
        navigate(`/evaluations/${created.id}`)
      }
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message || "Impossible de dupliquer l'évaluation.",
      })
    } finally {
      setDuplicatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des évaluations...</p>
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
          <Button onClick={loadEvaluations}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-gray-900">
          ÉVALUATIONS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          Gérer les évaluations d&apos;enseignement : période de réponses,
          formations, UE et rubriques.
        </p>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-1 w-fit">
          <button
            type="button"
            onClick={() => setViewMode("mine")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "mine"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Mes évaluations
          </button>
          <button
            type="button"
            onClick={() => setViewMode("partagees")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "partagees"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Evaluations partagées
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-5">
        <EvaluationFilters
          search={search}
          onSearchChange={setSearch}
          academicYearActive={academicYearFilter != null}
          onToggleCurrentYear={() =>
            setAcademicYearFilter((prev) =>
              prev ? null : getCurrentAcademicYear(),
            )
          }
          selectedStates={selectedStates}
          onToggleState={(state) =>
            setSelectedStates((prev) =>
              prev.includes(state)
                ? prev.filter((s) => s !== state)
                : [...prev, state],
            )
          }
          onClearStates={() => setSelectedStates([])}
          onNewEvaluation={() => navigate("/evaluations/new")}
          showTeacherActions={!isAdmin}
        />
      </div>

      <EvaluationsTable
        evaluations={paginatedEvaluations}
        page={page}
        pageSize={pageSize}
        total={filteredEvaluations.length}
        onPageChange={setPage}
        onEdit={
          isAdmin
            ? undefined
            : (evaluation) => navigate(`/evaluations/${evaluation.idEvaluation}/edit`)
        }
        onView={(evaluation) =>
          navigate(`/evaluations/${evaluation.idEvaluation}`)
        }
        onDelete={isAdmin ? undefined : handleDelete}
        onDuplicate={isAdmin ? undefined : handleDuplicate}
        onOpenDroits={
          isAdmin
            ? undefined
            : (evaluation) => setDroitsDialogEvaluationId(evaluation.idEvaluation)
        }
        duplicatingId={duplicatingId}
      />

      <Dialog
        open={droitsDialogEvaluationId != null}
        onOpenChange={(open) => !open && setDroitsDialogEvaluationId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des droits de partage</DialogTitle>
          </DialogHeader>
          {droitsDialogEvaluationId != null && (
            <DroitsSection evaluationId={droitsDialogEvaluationId} />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’évaluation{" "}
              <strong>
                {deleteTarget?.anneeUniversitaire} (
                {deleteTarget?.codeFormation} - {deleteTarget?.codeUe})
              </strong>{" "}
              ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!deleteTarget) return
                try {
                  await deleteEvaluation(deleteTarget.idEvaluation)
                  toast.success("Évaluation supprimée")
                  await loadEvaluations()
                } catch (e: any) {
                  toast.error(e.message || "Impossible de supprimer.")
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

    </div>
  )
}

