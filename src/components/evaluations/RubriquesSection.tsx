import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"

import { getRubriques } from "../../services/Rubriqueservice"
import type { Rubrique } from "../../services/Rubriqueservice"
import {
  addRubriqueToEvaluation,
  addQuestionToRubriqueEvaluation,
  removeQuestionFromRubriqueEvaluation,
  removeRubriqueFromEvaluation,
  EvaluationWithRubriquesDTO,
} from "../../services/EvaluationService"
import { getQuestions, type Question } from "../../services/Questionservice"

interface RubriquesSectionProps {
  rubriques: EvaluationWithRubriquesDTO["rubriques"]
  onChange: (rubriques: EvaluationWithRubriquesDTO["rubriques"]) => void
  evaluationId?: number
  onReload?: () => void
}

export function RubriquesSection({
  rubriques,
  onChange,
  evaluationId,
  onReload,
}: RubriquesSectionProps) {
  const [availableRubriques, setAvailableRubriques] = useState<Rubrique[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])

  const [selectedRubriqueId, setSelectedRubriqueId] = useState<number | null>(
    null,
  )
  const [isRubriqueDialogOpen, setIsRubriqueDialogOpen] = useState(false)

  const [activeRubriqueEvaluationId, setActiveRubriqueEvaluationId] = useState<
    number | null
  >(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  )
  const [questionSearch, setQuestionSearch] = useState("")
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)

  useEffect(() => {
    void loadRubriques()
    void loadQuestions()
  }, [])

  const loadRubriques = async () => {
    const data = await getRubriques()
    setAvailableRubriques(data)
  }

  const loadQuestions = async () => {
    const data = await getQuestions()
    setAvailableQuestions(data)
  }

  const handleAddRubrique = async () => {
    if (!selectedRubriqueId || !evaluationId) return

    try {
      await addRubriqueToEvaluation(evaluationId, selectedRubriqueId)
      if (onReload) {
        await onReload()
      }
      setSelectedRubriqueId(null)
      setIsRubriqueDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la rubrique :", error)
    }
  }

  const handleRemoveRubrique = async (rubriqueEvaluationId: number) => {
    if (!evaluationId) return
    try {
      await removeRubriqueFromEvaluation(evaluationId, rubriqueEvaluationId)
      if (onReload) {
        await onReload()
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la rubrique :", error)
    }
  }

  const openQuestionDialog = (rubriqueEvaluationId: number) => {
    if (!evaluationId) return
    setActiveRubriqueEvaluationId(rubriqueEvaluationId)
    setSelectedQuestionId(null)
    setQuestionSearch("")
    setIsQuestionDialogOpen(true)
  }

  const handleAddQuestion = async () => {
    if (
      !evaluationId ||
      !activeRubriqueEvaluationId ||
      !selectedQuestionId
    )
      return
    try {
      await addQuestionToRubriqueEvaluation(
        evaluationId,
        activeRubriqueEvaluationId,
        selectedQuestionId,
      )
      if (onReload) {
        await onReload()
      }
      setIsQuestionDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la question :", error)
    }
  }

  const handleRemoveQuestion = async (
    rubriqueEvaluationId: number,
    questionEvaluationId: number,
  ) => {
    if (!evaluationId) return
    try {
      await removeQuestionFromRubriqueEvaluation(
        evaluationId,
        rubriqueEvaluationId,
        questionEvaluationId,
      )
      if (onReload) {
        await onReload()
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la question :", error)
    }
  }

  const filteredQuestions = availableQuestions.filter((q) => {
    if (!activeRubriqueEvaluationId) return false
    const rubrique = rubriques.find(
      (r) => r.idRubriqueEvaluation === activeRubriqueEvaluationId,
    )
    const alreadyUsedIds = new Set(
      (rubrique?.questions || []).map((qq) => qq.idQuestion),
    )
    const matchesSearch = q.intitule
      .toLowerCase()
      .includes(questionSearch.toLowerCase())
    return !alreadyUsedIds.has(q.idQuestion) && matchesSearch
  })

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Rubriques de l&apos;évaluation
        </h2>

        <Dialog open={isRubriqueDialogOpen} onOpenChange={setIsRubriqueDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!evaluationId}
              className="rounded-full"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter une rubrique
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sélectionner une rubrique</DialogTitle>
            </DialogHeader>

            <div className="max-h-80 overflow-y-auto rounded-md border">
              {availableRubriques.map((r) => (
                <div
                  key={r.idRubrique}
                  onClick={() => setSelectedRubriqueId(r.idRubrique)}
                  className={`cursor-pointer border-b px-3 py-2 text-sm hover:bg-gray-100 ${selectedRubriqueId === r.idRubrique
                      ? "bg-blue-50"
                      : "bg-white"
                    }`}
                >
                  <div className="font-medium text-gray-900">
                    {r.designation}
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.questions?.length || 0} question
                    {r.questions?.length && r.questions.length > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleAddRubrique}
                disabled={!selectedRubriqueId}
                className="w-full"
              >
                Ajouter à l&apos;évaluation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {(!rubriques || rubriques.length === 0) && (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
          Aucune rubrique associée à cette évaluation pour le moment.
          {evaluationId
            ? " Utilisez le bouton « Ajouter une rubrique » pour commencer."
            : " Enregistrez d'abord l'évaluation pour pouvoir y associer des rubriques."}
        </div>
      )}

      <div className="space-y-5">
        {rubriques?.map((rubrique) => (
          <div
            key={rubrique.idRubriqueEvaluation}
            className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* HEADER RUBRIQUE */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {rubrique.designation}
                </h3>

                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  {rubrique.type && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                      {rubrique.type}
                    </span>
                  )}
                  <span>
                    {rubrique.questions?.length || 0} question
                    {rubrique.questions && rubrique.questions.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-600"
                disabled={!evaluationId}
                onClick={() =>
                  handleRemoveRubrique(rubrique.idRubriqueEvaluation)
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* QUESTIONS */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Questions
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-dashed text-xs"
                  disabled={!evaluationId}
                  onClick={() =>
                    openQuestionDialog(rubrique.idRubriqueEvaluation)
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>

              {(!rubrique.questions || rubrique.questions.length === 0) && (
                <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
                  Aucune question dans cette rubrique.
                </div>
              )}

              <div className="space-y-2">
                {rubrique.questions?.map((question) => (
                  <div
                    key={question.idQuestion}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    <span className="text-gray-800">
                      {question.intitule}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      disabled={!evaluationId}
                      onClick={() =>
                        handleRemoveQuestion(
                          rubrique.idRubriqueEvaluation,
                          question.idQuestionEvaluation
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>


      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une question à la rubrique</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              placeholder="Rechercher une question..."
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              className="h-9 text-sm"
            />

            <div className="max-h-80 overflow-y-auto rounded-md border">
              {filteredQuestions.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Aucune question disponible.
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.idQuestion}
                    onClick={() => setSelectedQuestionId(q.idQuestion)}
                    className={`cursor-pointer border-b px-3 py-2 text-sm hover:bg-gray-100 ${selectedQuestionId === q.idQuestion
                        ? "bg-blue-50"
                        : "bg-white"
                      }`}
                  >
                    {q.intitule}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleAddQuestion}
              disabled={!selectedQuestionId}
              className="w-full"
            >
              Ajouter la question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

