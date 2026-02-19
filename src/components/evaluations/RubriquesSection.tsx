import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Check, LayoutList, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { getRubriques } from "../../services/Rubriqueservice"
import type { Rubrique } from "../../services/Rubriqueservice"
import {
  addRubriqueToEvaluation,
  addQuestionToRubriqueEvaluation,
  removeQuestionFromRubriqueEvaluation,
  removeRubriqueFromEvaluation,
  reorderRubriquesInEvaluation,
  reorderQuestionsInRubriqueEvaluation,
  EvaluationWithRubriquesDTO,
  RubriqueEvaluationDTO,
  QuestionEvaluationDTO,
} from "../../services/EvaluationService"
import { getQuestions, type Question } from "../../services/Questionservice"

interface RubriquesSectionProps {
  rubriques: EvaluationWithRubriquesDTO["rubriques"]
  onChange: (rubriques: EvaluationWithRubriquesDTO["rubriques"]) => void
  evaluationId?: number
  onReload?: () => void
}

/* Sortable question row inside a rubrique */
function SortableQuestionRow({
  question,
  rubriqueEvaluationId,
  evaluationId,
  onRemove,
}: {
  question: QuestionEvaluationDTO
  rubriqueEvaluationId: number
  evaluationId?: number
  onRemove: (rubriqueEvaluationId: number, questionEvaluationId: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.idQuestionEvaluation.toString(),
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 sm:px-4 text-sm hover:bg-gray-100 transition min-w-0"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="text-gray-800 truncate min-w-0 flex-1">{question.intitule}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-gray-400 hover:text-red-600"
        disabled={!evaluationId}
        onClick={() => onRemove(rubriqueEvaluationId, question.idQuestionEvaluation)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

/* Sortable rubrique card with accordion (expand/collapse) and sortable questions */
function SortableRubriqueCard({
  rubrique,
  isExpanded,
  onToggleExpand,
  evaluationId,
  onRemoveRubrique,
  onRemoveQuestion,
  onQuestionDragEnd,
  openQuestionDialog,
}: {
  rubrique: RubriqueEvaluationDTO
  isExpanded: boolean
  onToggleExpand: (id: number) => void
  evaluationId?: number
  onRemoveRubrique: (id: number) => void
  onRemoveQuestion: (rubriqueEvaluationId: number, questionEvaluationId: number) => void
  onQuestionDragEnd: (rubriqueEvaluationId: number, event: DragEndEvent) => void
  openQuestionDialog: (rubriqueEvaluationId: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rubrique.idRubriqueEvaluation.toString(),
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  }
  const questions = rubrique.questions ?? []
  const questionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${isDragging ? "shadow-lg ring-2 ring-gray-200" : ""}`}
    >
      {/* Accordion header */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <button
          type="button"
          onClick={() => onToggleExpand(rubrique.idRubriqueEvaluation)}
          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200 transition"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{rubrique.designation}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
            {rubrique.type && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5">{rubrique.type}</span>
            )}
            <span>{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-gray-400 hover:text-red-600"
          disabled={!evaluationId}
          onClick={() => onRemoveRubrique(rubrique.idRubriqueEvaluation)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Accordion body: questions (collapsible) */}
      {isExpanded && (
        <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-3 bg-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Questions</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-dashed text-xs w-full sm:w-auto"
              disabled={!evaluationId}
              onClick={() => openQuestionDialog(rubrique.idRubriqueEvaluation)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
          {questions.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
              Aucune question dans cette rubrique.
            </div>
          ) : (
            <DndContext
              sensors={questionSensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onQuestionDragEnd(rubrique.idRubriqueEvaluation, e)}
            >
              <SortableContext
                items={questions.map((q) => q.idQuestionEvaluation.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {questions.map((q) => (
                    <SortableQuestionRow
                      key={q.idQuestionEvaluation}
                      question={q}
                      rubriqueEvaluationId={rubrique.idRubriqueEvaluation}
                      evaluationId={evaluationId}
                      onRemove={onRemoveQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  )
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
  const [expandedRubriqueIds, setExpandedRubriqueIds] = useState<Set<number>>(new Set())

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

  const toggleRubriqueExpanded = useCallback((id: number) => {
    setExpandedRubriqueIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const rubriqueSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleRubriqueDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !evaluationId || !rubriques?.length) return
      const oldIndex = rubriques.findIndex(
        (r) => r.idRubriqueEvaluation.toString() === active.id
      )
      const newIndex = rubriques.findIndex(
        (r) => r.idRubriqueEvaluation.toString() === over.id
      )
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(rubriques, oldIndex, newIndex)
      onChange(reordered)
      const rubriqueOrders = reordered.map((r, i) => ({
        idRubriqueEvaluation: r.idRubriqueEvaluation,
        ordre: i + 1,
      }))
      try {
        await reorderRubriquesInEvaluation(evaluationId, { rubriqueOrders })
        if (onReload) await onReload()
      } catch (err) {
        console.error("Erreur réordonnancement rubriques :", err)
      }
    },
    [evaluationId, rubriques, onReload]
  )

  const handleQuestionDragEnd = useCallback(
    async (rubriqueEvaluationId: number, event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !evaluationId) return
      const rubrique = rubriques?.find(
        (r) => r.idRubriqueEvaluation === rubriqueEvaluationId
      )
      if (!rubrique?.questions?.length) return
      const questions = rubrique.questions
      const oldIndex = questions.findIndex(
        (q) => q.idQuestionEvaluation.toString() === active.id
      )
      const newIndex = questions.findIndex(
        (q) => q.idQuestionEvaluation.toString() === over.id
      )
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(questions, oldIndex, newIndex)
      const updatedRubriques = rubriques.map((r) =>
          r.idRubriqueEvaluation === rubriqueEvaluationId
              ? { ...r, questions: reordered }
              : r
      )
      onChange(updatedRubriques)
      const questionOrders = reordered.map((q, i) => ({
        idQuestionEvaluation: q.idQuestionEvaluation,
        ordre: i + 1,
      }))
      try {
        await reorderQuestionsInRubriqueEvaluation(
          evaluationId,
          rubriqueEvaluationId,
          { questionOrders }
        )
        if (onReload) await onReload()
      } catch (err) {
        console.error("Erreur réordonnancement questions :", err)
      }
    },
    [evaluationId, rubriques, onReload]
  )

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
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900 truncate">
          Rubriques de l&apos;évaluation
        </h2>

        <Dialog open={isRubriqueDialogOpen} onOpenChange={setIsRubriqueDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!evaluationId}
              className="rounded-full w-full sm:w-auto shrink-0"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter une rubrique
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden flex flex-col sm:max-h-[85vh]">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-2 text-gray-500">
                <LayoutList className="h-5 w-5 shrink-0" />
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Ajouter une rubrique à l&apos;évaluation
                </DialogTitle>
              </div>
              <p className="text-sm text-gray-500 font-normal mt-1">
                Choisissez une rubrique dans le catalogue. Elle sera ajoutée avec ses questions existantes.
              </p>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-gray-200/90 bg-gray-50/30 p-2 sm:p-3">
              <div className="grid gap-2 sm:gap-3">
                {availableRubriques.map((r) => {
                  const isSelected = selectedRubriqueId === r.idRubrique
                  const questionCount = r.questions?.length ?? 0
                  return (
                    <button
                      key={r.idRubrique}
                      type="button"
                      onClick={() => setSelectedRubriqueId(r.idRubrique)}
                      className={`group relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/80 shadow-sm ring-0"
                          : "border-transparent bg-white hover:border-gray-200 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </div>
                      )}
                      <div className="pr-8">
                        <div className={`font-semibold text-gray-900 ${isSelected ? "text-blue-900" : ""}`}>
                          {r.designation}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                            {questionCount} question{questionCount !== 1 ? "s" : ""}
                          </span>
                          {r.type && (
                            <span className="text-gray-400">{r.type}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRubriqueDialogOpen(false)}
                className="order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleAddRubrique}
                disabled={!selectedRubriqueId}
                className="order-1 sm:order-2 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
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

      <DndContext
        sensors={rubriqueSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleRubriqueDragEnd}
      >
        <SortableContext
          items={(rubriques ?? []).map((r) => r.idRubriqueEvaluation.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {(rubriques ?? []).map((rubrique) => (
              <SortableRubriqueCard
                key={rubrique.idRubriqueEvaluation}
                rubrique={rubrique}
                isExpanded={expandedRubriqueIds.has(rubrique.idRubriqueEvaluation)}
                onToggleExpand={toggleRubriqueExpanded}
                evaluationId={evaluationId}
                onRemoveRubrique={handleRemoveRubrique}
                onRemoveQuestion={handleRemoveQuestion}
                onQuestionDragEnd={handleQuestionDragEnd}
                openQuestionDialog={openQuestionDialog}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>


      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto sm:max-h-none">
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