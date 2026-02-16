import { Plus, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../ui/label"
import {
  EvaluationQuestionPayload,
  EvaluationRubriquePayload,
} from "../../services/EvaluationService"

interface RubriquesSectionProps {
  rubriques: EvaluationRubriquePayload[]
  onChange: (rubriques: EvaluationRubriquePayload[]) => void
}

export function RubriquesSection({
  rubriques,
  onChange,
}: RubriquesSectionProps) {
  const addRubrique = () => {
    const newRubrique: EvaluationRubriquePayload = {
      idRubrique: undefined,
      titre: "",
      questions: [],
    }
    onChange([...(rubriques || []), newRubrique])
  }

  const updateRubrique = (
    index: number,
    updated: Partial<EvaluationRubriquePayload>,
  ) => {
    const copy = [...rubriques]
    copy[index] = { ...copy[index], ...updated }
    onChange(copy)
  }

  const removeRubrique = (index: number) => {
    const copy = [...rubriques]
    copy.splice(index, 1)
    onChange(copy)
  }

  const addQuestion = (rubriqueIndex: number) => {
    const question: EvaluationQuestionPayload = {
      idQuestion: undefined,
      intitule: "",
    }
    const copy = [...rubriques]
    const rubrique = copy[rubriqueIndex]
    rubrique.questions = [...(rubrique.questions || []), question]
    onChange(copy)
  }

  const updateQuestion = (
    rubriqueIndex: number,
    questionIndex: number,
    updated: Partial<EvaluationQuestionPayload>,
  ) => {
    const copy = [...rubriques]
    const rubrique = copy[rubriqueIndex]
    const questions = [...(rubrique.questions || [])]
    questions[questionIndex] = { ...questions[questionIndex], ...updated }
    rubrique.questions = questions
    onChange(copy)
  }

  const removeQuestion = (rubriqueIndex: number, questionIndex: number) => {
    const copy = [...rubriques]
    const rubrique = copy[rubriqueIndex]
    const questions = [...(rubrique.questions || [])]
    questions.splice(questionIndex, 1)
    rubrique.questions = questions
    onChange(copy)
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">
          Rubriques & questions
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRubrique}
          className="h-8 rounded-full border-dashed"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Ajouter une rubrique
        </Button>
      </div>

      {(!rubriques || rubriques.length === 0) && (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          Aucune rubrique pour le moment. Ajoutez une première rubrique pour
          structurer votre évaluation.
        </div>
      )}

      <div className="space-y-4">
        {rubriques?.map((rubrique, rubriqueIndex) => (
          <div
            key={rubriqueIndex}
            className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1.5">
                <Label>Nom de la rubrique</Label>
                <Input
                  placeholder="Ex : Organisation du cours"
                  value={rubrique.titre}
                  onChange={(e) =>
                    updateRubrique(rubriqueIndex, { titre: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-7 h-8 w-8 text-gray-400 hover:text-red-600"
                onClick={() => removeRubrique(rubriqueIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Questions de la rubrique
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-dashed"
                  onClick={() => addQuestion(rubriqueIndex)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Ajouter une question
                </Button>
              </div>

              {(!rubrique.questions || rubrique.questions.length === 0) && (
                <div className="rounded-md border border-dashed border-gray-200 bg-white px-3 py-3 text-xs text-gray-500">
                  Aucune question dans cette rubrique.
                </div>
              )}

              <div className="space-y-2">
                {rubrique.questions?.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="flex items-start gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
                  >
                    <div className="mt-1 text-xs text-gray-400">
                      {questionIndex + 1}.
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-600">
                        Intitulé de la question
                      </Label>
                      <Input
                        placeholder="Ex : Le rythme du cours vous semble-t-il adapté ?"
                        value={question.intitule}
                        onChange={(e) =>
                          updateQuestion(rubriqueIndex, questionIndex, {
                            intitule: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-5 h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() =>
                        removeQuestion(rubriqueIndex, questionIndex)
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
    </div>
  )
}

