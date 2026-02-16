import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  EvaluationListItem,
  EvaluationStatus,
} from "../../services/EvaluationService"

interface EvaluationsTableProps {
  evaluations: EvaluationListItem[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onEdit: (evaluation: EvaluationListItem) => void
  onDelete: (evaluation: EvaluationListItem) => void
}

function getStatusLabel(status: EvaluationStatus) {
  switch (status) {
    case "EN_COURS":
      return "En cours"
    case "TERMINE":
      return "Terminé"
    case "BROUILLON":
      return "Brouillon"
    default:
      return status
  }
}

function getStatusBadgeVariant(status: EvaluationStatus) {
  switch (status) {
    case "EN_COURS":
      return "default" as const
    case "TERMINE":
      return "outline" as const
    case "BROUILLON":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

export function EvaluationsTable({
  evaluations,
  page,
  pageSize,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: EvaluationsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Année universitaire</th>
              <th className="px-4 py-3 text-left">Formation</th>
              <th className="px-4 py-3 text-left">UE</th>
              <th className="px-4 py-3 text-left">État</th>
              <th className="px-4 py-3 text-left">Date début</th>
              <th className="px-4 py-3 text-left">Date fin</th>
              <th className="px-4 py-3 text-left">Partage</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
            {evaluations.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  Aucune évaluation trouvée.
                </td>
              </tr>
            ) : (
              evaluations.map((evaluation) => (
                <tr key={evaluation.idEvaluation} className="hover:bg-gray-50/60">
                  <td className="whitespace-nowrap px-4 py-3">
                    {evaluation.anneeUniversitaire}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {evaluation.libelleFormation || evaluation.codeFormation}
                      </span>
                      {evaluation.libelleFormation && (
                        <span className="text-xs text-gray-500">
                          {evaluation.codeFormation}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{evaluation.libelleUe || evaluation.codeUe}</span>
                      {evaluation.libelleUe && (
                        <span className="text-xs text-gray-500">
                          {evaluation.codeUe}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={getStatusBadgeVariant(evaluation.etat)}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {getStatusLabel(evaluation.etat)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {new Date(evaluation.debutReponse).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {new Date(evaluation.finReponse).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {/* Placeholder colonne Partage */}
                    À venir
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(evaluation)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(evaluation)}
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

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
        <div>
          Page {page} / {totalPages} &nbsp;•&nbsp; {total} évaluation
          {total > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

