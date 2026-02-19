import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  deleteEvaluation,
  EvaluationListItem,
  EvaluationFilters as EvaluationFiltersType,
  getEvaluations,
  getEvaluationsPartagees,
} from "../../services/EvaluationService"
import { EvaluationFilters } from "../../components/evaluations/EvaluationFilters"
import { EvaluationsTable } from "../../components/evaluations/EvaluationsTable"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"

export function EvaluationsPage() {
  const navigate = useNavigate()

  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   console.log("Evaluations:", evaluations)

  const [search, setSearch] = useState("")
  const [onlyCurrentYear, setOnlyCurrentYear] = useState(false)
  const [viewMode, setViewMode] = useState<"mine" | "partagees">("mine")

  const [page, setPage] = useState(1)
  const pageSize = 10

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)

      const data =
        viewMode === "partagees"
          ? await getEvaluationsPartagees()
          : await getEvaluations({
              search: search || undefined,
              onlyCurrentYear: onlyCurrentYear || undefined,
            } as EvaluationFiltersType)

      setEvaluations(data)
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des évaluations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvaluations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyCurrentYear, viewMode])

  const filteredEvaluations = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return evaluations

    return evaluations.filter((e) => {
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
  }, [evaluations, search])

  const paginatedEvaluations = useMemo(() => {
    if (!Array.isArray(filteredEvaluations)) return []
    const start = (page - 1) * pageSize
    return filteredEvaluations.slice(start, start + pageSize)
  }, [filteredEvaluations, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleDelete = async (evaluation: EvaluationListItem) => {
    const confirmed = window.confirm(
      `Supprimer l'évaluation de ${evaluation.anneeUniversitaire} (${evaluation.codeFormation} - ${evaluation.codeUe}) ?`,
    )
    if (!confirmed) return

    try {
      
      await deleteEvaluation(evaluation.idEvaluation)
      await loadEvaluations()
    } catch (e: any) {
      alert(e.message || "Impossible de supprimer l'évaluation.")
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
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "mine"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mes évaluations
          </button>
          <button
            type="button"
            onClick={() => setViewMode("partagees")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "partagees"
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
          onlyCurrentYear={onlyCurrentYear}
          onToggleCurrentYear={() => setOnlyCurrentYear((v) => !v)}
          onNewEvaluation={() => navigate("/evaluations/new")}
        />
      </div>

      <EvaluationsTable
        evaluations={paginatedEvaluations}
        page={page}
        pageSize={pageSize}
        total={filteredEvaluations.length}
        onPageChange={setPage}
        onEdit={(evaluation) => navigate(`/evaluations/${evaluation.idEvaluation}`)}
        onDelete={handleDelete}
      />
    </div>
  )
}

