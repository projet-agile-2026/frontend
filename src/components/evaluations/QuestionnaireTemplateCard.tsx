import { useState } from "react"
import { ChevronDown, ChevronRight, FileQuestion, LayoutList } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import {
  type QuestionnaireTemplateDetailDTO,
  type RubriqueQuestionnaireTemplateDTO,
  type QuestionQuestionnaireTemplateDTO,
} from "../../services/EvaluationService"
import { getRubriqueTypeLabel, getRubriqueTypeStyle } from "../../utils/rubriqueType"

interface QuestionnaireTemplateCardProps {
  questionnaire: QuestionnaireTemplateDetailDTO
  onUseAsTemplate: (idQuestionnaire: number) => void
  isLoadingDetail?: boolean
}

function QuestionRow({ question }: { question: QuestionQuestionnaireTemplateDTO }) {
  const scale =
    question.maximal && question.minimal
      ? `${question.maximal} ↔ ${question.minimal}`
      : "Échelle non définie"
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm min-w-0">
      <span className="flex-1 text-gray-800">{question.intitule}</span>
      <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{scale}</span>
    </div>
  )
}

function RubriqueBlock({
  rubrique,
  isExpanded,
  onToggle,
}: {
  rubrique: RubriqueQuestionnaireTemplateDTO
  isExpanded: boolean
  onToggle: () => void
}) {
  const questions = rubrique.questions ?? []
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-3 py-2.5 sm:px-4 text-left hover:bg-gray-100 transition min-w-0"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-500" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {rubrique.designation}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span>
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </button>
      {isExpanded && (
        <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2 bg-white">
          {questions.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
              Aucune question dans cette rubrique.
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q) => (
                <QuestionRow key={q.idQuestion} question={q} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function QuestionnaireTemplateCard({
  questionnaire,
  onUseAsTemplate,
  isLoadingDetail = false,
}: QuestionnaireTemplateCardProps) {
  const [expandedRubriqueIds, setExpandedRubriqueIds] = useState<Set<number>>(new Set())
  const rubriques = questionnaire.rubriques ?? []

  const toggleRubrique = (idRubriqueQuestionnaire: number) => {
    setExpandedRubriqueIds((prev) => {
      const next = new Set(prev)
      if (next.has(idRubriqueQuestionnaire)) next.delete(idRubriqueQuestionnaire)
      else next.add(idRubriqueQuestionnaire)
      return next
    })
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {questionnaire.designation}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {rubriques.length} rubrique{rubriques.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onUseAsTemplate(questionnaire.idQuestionnaire)}
            disabled={isLoadingDetail}
            className="w-full sm:w-auto shrink-0 rounded-xl font-medium"
          >
            Utiliser ce questionnaire
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4 sm:px-5">
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            Chargement des rubriques...
          </div>
        ) : rubriques.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500 flex items-center gap-2">
            <LayoutList className="h-4 w-4 shrink-0" />
            Aucune rubrique dans ce questionnaire.
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Rubriques
            </span>
            <div className="space-y-3">
              {rubriques.map((rubrique) => (
                <RubriqueBlock
                  key={rubrique.idRubriqueQuestionnaire}
                  rubrique={rubrique}
                  isExpanded={expandedRubriqueIds.has(rubrique.idRubriqueQuestionnaire)}
                  onToggle={() => toggleRubrique(rubrique.idRubriqueQuestionnaire)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
