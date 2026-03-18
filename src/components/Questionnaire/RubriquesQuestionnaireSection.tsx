import { useEffect, useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog"

import { getRubriques } from "../../services/Rubriqueservice"
import { getQuestions } from "../../services/Questionservice"


import {
  addRubriqueToQuestionnaire,
  addQuestionToRubriqueQuestionnaire,
  removeRubriqueFromQuestionnaire,
  removeQuestionFromRubriqueQuestionnaire,
} from "../../services/QuestionnaireService"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { Input } from "../ui/input"

interface Props {
  rubriques: any[]
  questionnaireId?: number
  onReload?: () => void
  readOnly?: boolean
}

export function RubriquesQuestionnaireSection({
  rubriques,
  questionnaireId,
  onReload,
  readOnly = false,
}: Props) {

  const [availableRubriques, setAvailableRubriques] = useState<any[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([])

  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const [search, setSearch] = useState("")
  const [selectedRubriques, setSelectedRubriques] = useState<number[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)

  const [activeRubrique, setActiveRubrique] = useState<number | null>(null)

  const [rubriqueDialogOpen, setRubriqueDialogOpen] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)

  const [expandedCatalogRubriques, setExpandedCatalogRubriques] = useState<Set<number>>(new Set())

  useEffect(() => {

    const load = async () => {

      const r = await getRubriques()
      const q = await getQuestions()

      setAvailableRubriques(r)
      setAvailableQuestions(q)

    }

    load()

  }, [])

  const toggleRubrique = (id: number) => {

    setSelectedRubriques(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )

  }

  const toggleExpand = (id: number) => {

    const next = new Set(expanded)

    if (next.has(id)) next.delete(id)
    else next.add(id)

    setExpanded(next)

  }

  const toggleCatalogRubrique = (id: number) => {

    const next = new Set(expandedCatalogRubriques)

    if (next.has(id)) next.delete(id)
    else next.add(id)

    setExpandedCatalogRubriques(next)

  }

  const handleAddRubriques = async () => {

    if (!questionnaireId) return

    await Promise.all(
      selectedRubriques.map(id =>
        addRubriqueToQuestionnaire(questionnaireId, id)
      )
    )
    console.log("rubques", selectedRubriques)

    setSelectedRubriques([])
    setRubriqueDialogOpen(false)

    if (onReload) await onReload()

  }

  const usedRubriqueIds = new Set(
    rubriques.map(r => r.idRubrique)
  )

  const filteredRubriques = availableRubriques
    .filter(r => !usedRubriqueIds.has(r.idRubrique))
    .filter(r =>
      r.designation.toLowerCase().includes(search.toLowerCase())
    )

  const handleRemoveRubrique = async (id: number) => {

    if (!questionnaireId) return

    await removeRubriqueFromQuestionnaire(
      questionnaireId,
      id
    )

    if (onReload) await onReload()

  }

  const openQuestionDialog = (rubriqueId: number) => {

    setActiveRubrique(rubriqueId)
    setSelectedQuestionId(null)
    setQuestionDialogOpen(true)

  }

  const handleAddQuestion = async () => {

    if (!questionnaireId || !activeRubrique || !selectedQuestionId) return

    await addQuestionToRubriqueQuestionnaire(
      questionnaireId,
      activeRubrique,
      selectedQuestionId
    )

    setQuestionDialogOpen(false)

    if (onReload) await onReload()

  }

  const handleRemoveQuestion = async (
    rubriqueId: number,
    questionId: number
  ) => {

    if (!questionnaireId) return

    await removeQuestionFromRubriqueQuestionnaire(
      questionnaireId,
      rubriqueId,
      questionId
    )

    if (onReload) await onReload()

  }
  console.log("RubriqueQuestionnaire", rubriques)

  return (

    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">

      <div className="flex justify-between items-center">

        <h2 className="text-base font-semibold text-gray-900">
          Rubriques du questionnaire
        </h2>

        <Dialog open={rubriqueDialogOpen} onOpenChange={setRubriqueDialogOpen}>

          <DialogTrigger asChild>

            <TooltipProvider>
              <Tooltip>

                <TooltipTrigger asChild>
                  <span>

                    {!readOnly && (
                      <Dialog open={rubriqueDialogOpen} onOpenChange={setRubriqueDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!questionnaireId}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter une rubrique
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-3xl">
                          ...
                        </DialogContent>
                      </Dialog>
                    )}

                  </span>
                </TooltipTrigger>

                {!questionnaireId && (
                  <TooltipContent>
                    Saisissez une désignation puis cliquez sur
                    <b> Enregistrer </b>
                    pour pouvoir ajouter des rubriques.
                  </TooltipContent>
                )}

              </Tooltip>
            </TooltipProvider>

          </DialogTrigger>

          <DialogContent className="max-w-3xl">

            <DialogHeader>

              <DialogTitle>
                Ajouter une rubrique au questionnaire
              </DialogTitle>

            </DialogHeader>

            <Input
              placeholder="Rechercher une rubrique..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="max-h-[400px] overflow-y-auto rounded-lg border bg-gray-50 p-3">

              <div className="grid gap-2">

                {filteredRubriques.map((r) => {

                  const isSelected = selectedRubriques.includes(r.idRubrique)
                  const isExpanded = expandedCatalogRubriques.has(r.idRubrique)

                  return (

                    <div
                      key={r.idRubrique}
                      className={`rounded-lg border transition
      ${isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                        }`}
                    >

                      {/* Header rubrique */}

                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => toggleRubrique(r.idRubrique)}
                      >

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCatalogRubrique(r.idRubrique)
                            }}
                          >

                            {isExpanded
                              ? <ChevronDown className="h-4 w-4 text-gray-500" />
                              : <ChevronRight className="h-4 w-4 text-gray-500" />}

                          </button>

                          <span className="font-medium text-gray-900">
                            {r.designation}
                          </span>

                        </div>

                        <span className="text-xs text-gray-500">
                          {r.questions?.length ?? 0} questions
                        </span>

                      </div>

                      {/* Questions */}

                      {isExpanded && (

                        <div className="px-4 pb-3 space-y-1">

                          {r.questions?.length === 0 && (
                            <div className="text-xs text-gray-400">
                              Aucune question
                            </div>
                          )}

                          {r.questions?.map((q: any) => (

                            <div
                              key={q.idQuestion}
                              className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
                            >

                              {q.intitule}

                            </div>

                          ))}

                        </div>

                      )}

                    </div>

                  )

                })}

              </div>

            </div>

            <DialogFooter>

              <Button
                variant="outline"
                onClick={() => setRubriqueDialogOpen(false)}
              >
                Annuler
              </Button>

              <Button
                onClick={handleAddRubriques}
                disabled={selectedRubriques.length === 0}
              >

                Ajouter {selectedRubriques.length}

              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </div>

      {rubriques.length === 0 && (

        <div className="text-sm text-gray-400 border border-dashed p-4 rounded-md">

          Aucune rubrique pour ce questionnaire

        </div>

      )}

      {rubriques.map((r) => {

        const isOpen = expanded.has(r.idRubriqueQuestionnaire)

        return (

          <div
            key={r.idRubriqueQuestionnaire}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >

            <div className="flex items-center gap-2 border-b px-4 py-3 bg-gray-50">

              <button
                onClick={() => toggleExpand(r.idRubriqueQuestionnaire)}
              >
                {isOpen
                  ? <ChevronDown className="h-4 w-4" />
                  : <ChevronRight className="h-4 w-4" />}
              </button>

              <div className="flex-1 font-semibold text-gray-900">

                {r.designation}

              </div>

              {!readOnly && (

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleRemoveRubrique(r.idRubriqueQuestionnaire)
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>

              )}

            </div>

            {isOpen && (

              <div className="p-4 space-y-3">

                {r.questions?.map((q: any) => (

                  <div
                    key={q.idQuestionQuestionnaire}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm"
                  >

                    <div className="flex-1 grid grid-cols-12 items-center gap-2">

                      <span className="col-span-7 text-gray-800 truncate">
                        {q.intitule ?? q.designation}
                      </span>

                      <span className="col-span-4 text-xs text-gray-500 truncate">
                        {q.maximal && q.minimal
                          ? `${q.maximal} ↔ ${q.minimal}`
                          : "Échelle non définie"}
                      </span>

                    </div>

                    {!readOnly && (

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveQuestion(
                            r.idRubriqueQuestionnaire,
                            q.idQuestionQuestionnaire
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>

                    )}

                  </div>

                ))}

                {!readOnly && (

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openQuestionDialog(r.idRubriqueQuestionnaire)
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une question
                  </Button>

                )}

              </div>

            )}

          </div>

        )

      })}

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Ajouter une question
            </DialogTitle>
          </DialogHeader>

          <select
            className="w-full border rounded-md p-2"
            onChange={(e) =>
              setSelectedQuestionId(Number(e.target.value))
            }
          >

            <option>Choisir une question</option>

            {availableQuestions.map((q) => (

              <option key={q.idQuestion} value={q.idQuestion}>
                {q.intitule}
              </option>

            ))}

          </select>

          <DialogFooter>

            <Button
              onClick={handleAddQuestion}
              disabled={!selectedQuestionId}
            >
              Ajouter
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  )

}