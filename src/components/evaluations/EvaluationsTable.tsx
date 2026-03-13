import { Pencil, Trash2, Copy, Shield, Share2, Loader2, Eye } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  type EvaluationListItem,
  type EvaluationStatus,
} from "../../services/EvaluationService"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

interface EvaluationsTableProps {
  evaluations: EvaluationListItem[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onEdit?: (evaluation: EvaluationListItem) => void
  onDelete?: (evaluation: EvaluationListItem) => void
  onDuplicate?: (evaluation: EvaluationListItem) => void
  onOpenDroits?: (evaluation: EvaluationListItem) => void
  onView?: (evaluation: EvaluationListItem) => void
  duplicatingId?: number | null

  isOwnEvaluations?: boolean
}

function getStatusLabel(status: EvaluationStatus) {
  switch (status) {
    case "ELA":
      return "En cours d’élaboration"
    case "DIS":
      return "Mise à disposition"
    case "CLO":
      return "clôturée"
    default:
      return status
  }
}


function EvaluationCard({
  evaluation,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenDroits,
  onView,
  duplicatingId,
  getStatusLabel,
  getStatusBadgeVariant,
}: {
  evaluation: EvaluationListItem
  onEdit?: (e: EvaluationListItem) => void
  onDelete?: (e: EvaluationListItem) => void
  onDuplicate?: (e: EvaluationListItem) => void
  onOpenDroits?: (e: EvaluationListItem) => void
  onView?: (e: EvaluationListItem) => void
  duplicatingId?: number | null
  getStatusLabel: (s: EvaluationStatus) => string
  getStatusBadgeVariant: (s: EvaluationStatus) => "default" | "outline" | "secondary"
}) {
  const isDuplicating = duplicatingId === evaluation.idEvaluation
  const isLocked =
    evaluation.etat === "DIS" || evaluation.etat === "CLO"
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">
              {evaluation.libelleFormation || evaluation.codeFormation}
            </span>
            <Badge
              variant={getStatusBadgeVariant(evaluation.etat)}
              className="shrink-0 rounded-full px-2 py-0.5 text-xs"
            >
              {getStatusLabel(evaluation.etat)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {evaluation.anneeUniversitaire}
            {evaluation.codeUe && ` · ${evaluation.libelleUe || evaluation.codeUe}`}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(evaluation.debutReponse).toLocaleDateString()}
            {" → "}
            {new Date(evaluation.finReponse).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 flex-wrap">
          {onView && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onView(evaluation)}
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onOpenDroits && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onOpenDroits(evaluation)}
              title="Gestion des droits"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          {onDuplicate && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onDuplicate(evaluation)}
              disabled={isDuplicating}
              title="Dupliquer"
            >
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onEdit(evaluation)}
              title="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(evaluation)}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusBadgeVariant(status: EvaluationStatus) {
  switch (status) {
    case "ELA":
      return "default" as const
    case "DIS":
      return "outline" as const
    case "CLO":
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
  onDuplicate,
  onOpenDroits,
  onView,
  duplicatingId,
  isOwnEvaluations = false,
}: EvaluationsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Mobile: cards (no horizontal scroll) */}
      <div className="md:hidden divide-y divide-gray-100 p-3 sm:p-4">
        {evaluations.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Aucune évaluation trouvée.
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.idEvaluation}
                evaluation={evaluation}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onOpenDroits={onOpenDroits}
                onView={onView}
                duplicatingId={duplicatingId}
                getStatusLabel={getStatusLabel}
                getStatusBadgeVariant={getStatusBadgeVariant}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop/tablet: scrollable table */}
      <div className="hidden md:block overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="min-w-[48rem] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-3 lg:px-4 py-3 text-left">N°</th>
              <th className="px-3 lg:px-4 py-3 text-left">Année universitaire</th>
              <th className="px-3 lg:px-4 py-3 text-left">Désignation</th>
              <th className="px-3 lg:px-4 py-3 text-left">Formation</th>
              <th className="px-3 lg:px-4 py-3 text-left">État</th>
              <th className="px-3 lg:px-4 py-3 text-left">Date fin</th>
              <th className="px-3 lg:px-4 py-3 text-left">Partage</th>
              <th className="px-3 lg:px-4 py-3 text-right">Actions</th>
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
              evaluations.map((evaluation) => {

                const isLocked =
                  evaluation.etat === "DIS" || evaluation.etat === "CLO"

                return (

                <tr key={evaluation.idEvaluation} className="hover:bg-gray-50/60">
                  {/* numéro evaluation */}
                  <td className="px-3 lg:px-4 py-3 font-medium">
                    {evaluation.noEvaluation}
                  </td>

                  {/* année universitaire */}
                  <td className="whitespace-nowrap px-3 lg:px-4 py-3">
                    {evaluation.anneeUniversitaire}
                  </td>

                  {/* designation */}
                  <td className="px-3 lg:px-4 py-3">
                    {evaluation.designation}
                  </td>

                  {/* formation */}
                  <td className="px-3 lg:px-4 py-3">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {evaluation.libelleFormation || evaluation.codeFormation}
                      </span>
                      {evaluation.libelleFormation && (
                        <span className="text-xs text-gray-500">
                          {evaluation.codeFormation}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* etat */}
                  <td className="px-3 lg:px-4 py-3">
                    <Badge
                      variant={getStatusBadgeVariant(evaluation.etat)}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {getStatusLabel(evaluation.etat)}
                    </Badge>
                  </td>

                  {/* date fin format FR */}
                  <td className="whitespace-nowrap px-3 lg:px-4 py-3">
                    {new Date(evaluation.finReponse).toLocaleDateString("fr-FR")}
                  </td>

                  {/* partage */}
                  <td className="px-3 lg:px-4 py-3">
                    {onOpenDroits ? (() => {
                      const isOwner = isOwnEvaluations === true
                      return (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${!isOwner ? "cursor-not-allowed opacity-30" : ""}`}
                          onClick={() => isOwner && onOpenDroits(evaluation)}
                          disabled={!isOwner}
                          title={isOwner ? "Gestion des droits" : "Vous n'êtes pas propriétaire"}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )
                    })() : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* actions */}
                  <td className="whitespace-nowrap px-3 lg:px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">

                      {onDuplicate && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDuplicate(evaluation)}
                          disabled={duplicatingId === evaluation.idEvaluation}
                          title="Dupliquer"
                        >
                          {duplicatingId === evaluation.idEvaluation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {onView && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(evaluation)}
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {onEdit && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onEdit(evaluation)}
                                  disabled={isLocked} 
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>

                            {isLocked && (
                              <TooltipContent>
                                Impossible de modifier une évaluation mise à disposition ou clôturée
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {onDelete && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => onDelete(evaluation)}
                                  disabled={isLocked}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>

                            {isLocked && (
                              <TooltipContent>
                                Impossible de supprimer une évaluation mise à disposition ou clôturée
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )}


                    </div>
                  </td>
                </tr>
              )
              }
            )
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 text-xs text-gray-600">
        <div className="text-center sm:text-left">
          Page {page} / {totalPages} · {total} évaluation{total > 1 ? "s" : ""}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="min-w-[5rem]"
          >
            Précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="min-w-[5rem]"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

