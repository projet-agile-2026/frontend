import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  getQuestionnaireTemplates,
  getQuestionnaireTemplateById,
  type QuestionnaireTemplateListItemDTO,
  type QuestionnaireTemplateDetailDTO,
} from "@/services/EvaluationService"
import { QuestionnaireTemplateCard } from "@/components/evaluations/QuestionnaireTemplateCard"
import { CreateEvaluationFromTemplateDialog } from "@/components/evaluations/CreateEvaluationFromTemplateDialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, FileQuestion } from "lucide-react"

export function QuestionnaireTemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<QuestionnaireTemplateDetailDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<number | null>(null)
  const [selectedQuestionnaireDesignation, setSelectedQuestionnaireDesignation] = useState("")

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list: QuestionnaireTemplateListItemDTO[] = await getQuestionnaireTemplates()
      const details = await Promise.all(
        list.map((item) => getQuestionnaireTemplateById(item.idQuestionnaire))
      )
      setTemplates(details)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de charger les questionnaires templates."
      setError(message)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  const handleUseAsTemplate = (idQuestionnaire: number) => {
    const q = templates.find((t) => t.idQuestionnaire === idQuestionnaire)
    setSelectedQuestionnaireId(idQuestionnaire)
    setSelectedQuestionnaireDesignation(q?.designation ?? "")
    setTemplateDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setTemplateDialogOpen(open)
    if (!open) {
      setSelectedQuestionnaireId(null)
      setSelectedQuestionnaireDesignation("")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
          <p className="text-sm text-gray-600">Chargement des questionnaires templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-sm font-medium text-red-800">{error}</p>
          <Button variant="outline" onClick={() => void loadTemplates()}>
            Réessayer
          </Button>
          <Button variant="ghost" onClick={() => navigate("/evaluations")}>
            Retour aux évaluations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Créer une évaluation à partir d’un questionnaire
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Choisissez un questionnaire puis cliquez sur « Utiliser ce questionnaire » pour créer une nouvelle évaluation.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/evaluations")}
          className="w-full shrink-0 sm:w-auto"
        >
          Retour à la liste des évaluations
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
          <FileQuestion className="h-12 w-12 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Aucun questionnaire disponible.</p>
          <p className="text-xs text-gray-500">
            Les questionnaires créés par l'administrateur apparaîtront ici.
          </p>
          <Button variant="outline" onClick={() => navigate("/evaluations")}>
            Retour aux évaluations
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((questionnaire) => (
            <QuestionnaireTemplateCard
              key={questionnaire.idQuestionnaire}
              questionnaire={questionnaire}
              onUseAsTemplate={handleUseAsTemplate}
            />
          ))}
        </div>
      )}

      {selectedQuestionnaireId !== null && (
        <CreateEvaluationFromTemplateDialog
          open={templateDialogOpen}
          onOpenChange={handleDialogOpenChange}
          idQuestionnaire={selectedQuestionnaireId}
          questionnaireDesignation={selectedQuestionnaireDesignation}
        />
      )}
    </div>
  )
}
