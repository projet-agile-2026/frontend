import { useEffect, useState, useCallback } from "react"
import {
    Plus,
    Trash2,
    Check,
    LayoutList,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Loader2,
    Pencil,
    X,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"
import { getQualificatifs, type QualificatifDTO } from "../../services/Qualificatifservice"
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
    addRubriqueSpecifiqueToEvaluation,
    updateRubriqueSpecifique,
    addQuestionToRubriqueEvaluation,
    removeQuestionFromRubriqueEvaluation,
    removeRubriqueFromEvaluation,
    reorderRubriquesInEvaluation,
    reorderQuestionsInRubriqueEvaluation,
    updateDesignationRubriqueEvaluation,
    updateIntituleQuestionEvaluation,
    updateQualificatifQuestionEvaluation,
    type EvaluationWithRubriquesDTO,
    type RubriqueEvaluationDTO,
    type QuestionEvaluationDTO,
} from "../../services/EvaluationService"
import { getQuestions, type Question } from "../../services/Questionservice"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip"
import {
    getRubriqueTypeLabel,
    getRubriqueTypeStyle,
} from "../../utils/rubriqueType"

interface RubriquesSectionProps {
    rubriques: EvaluationWithRubriquesDTO["rubriques"]
    onChange: (rubriques: EvaluationWithRubriquesDTO["rubriques"]) => void
    evaluationId?: number
    onReload?: () => void
    readOnly?: boolean
    onEditingChange?: (isEditing: boolean) => void
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────────── */

const getQualificatifId = (q: QualificatifDTO): number =>
    Number((q as QualificatifDTO & { id?: number }).idQualificatif ?? (q as QualificatifDTO & { id?: number }).id)

const getQuestionEvalId = (question: QuestionEvaluationDTO): number => {
    const id = Number(question.idQuestionEvaluation)
    if (isNaN(id)) {
        console.error("❌ ID invalide:", question)
    }
    return id
}

const getQuestionCatalogId = (question: QuestionEvaluationDTO): number =>
    Number(question.idQuestion)

/* ──────────────────────────────────────────────────────────────────────────────
 * Sortable question row
 * ────────────────────────────────────────────────────────────────────────────── */
function SortableQuestionRow({
    question,
    rubriqueEvaluationId,
    evaluationId,
    onRemove,
    readOnly,
    isEditing,
    editingIntitule,
    onStartEdit,
    onConfirmEdit,
    onCancelEdit,
    onIntituleChange,
    onOpenQualificatif,
}: {
    question: QuestionEvaluationDTO
    rubriqueEvaluationId: number
    evaluationId?: number
    onRemove: (rubriqueEvaluationId: number, questionEvaluationId: number) => void
    readOnly: boolean
    isEditing: boolean
    editingIntitule: string
    onStartEdit: (intitule: string) => void
    onConfirmEdit: () => void
    onCancelEdit: () => void
    onIntituleChange: (value: string) => void
    onOpenQualificatif: () => void
}) {
    const questionEvaluationId = getQuestionEvalId(question)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: questionEvaluationId.toString(),
        disabled: readOnly,
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
                {...(!readOnly ? attributes : {})}
                {...(!readOnly ? listeners : {})}
                className={`flex-shrink-0 touch-none ${readOnly
                    ? "cursor-default text-gray-300"
                    : "cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    }`}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {isEditing ? (
                <div className="flex flex-1 items-center gap-2 min-w-0">
                    <Input
                        value={editingIntitule}
                        onChange={(e) => onIntituleChange(e.target.value)}
                        className="h-7 text-sm flex-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onConfirmEdit()
                            if (e.key === "Escape") onCancelEdit()
                        }}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onConfirmEdit()
                        }}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            onCancelEdit()
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-12 items-center gap-2 min-w-0">
                    <span className="col-span-7 text-gray-800 truncate">{question.intitule}</span>
                    <span className="col-span-4 text-xs text-gray-500 truncate">
                        {question.maximal && question.minimal
                            ? `${question.maximal} ↔ ${question.minimal}`
                            : "Échelle non définie"}
                    </span>
                </div>
            )}

            {!readOnly && !isEditing && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-gray-400 hover:text-blue-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            onStartEdit(question.intitule)
                        }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-gray-400 hover:text-purple-600"
                        title="Modifier le qualificatif"
                        onClick={(e) => {
                            e.stopPropagation()
                            onOpenQualificatif()
                        }}
                    >
                        <LayoutList className="h-3.5 w-3.5" />
                    </Button>
                </>
            )}

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-gray-400 hover:text-red-600"
                disabled={!evaluationId || readOnly}
                onClick={() => onRemove(rubriqueEvaluationId, questionEvaluationId)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Sortable rubrique card
 * ────────────────────────────────────────────────────────────────────────────── */
function SortableRubriqueCard({
    rubrique,
    isExpanded,
    onToggleExpand,
    evaluationId,
    onRemoveRubrique,
    onRemoveQuestion,
    onQuestionDragEnd,
    openQuestionDialog,
    readOnly,
    editingRubriqueId,
    editingDesignation,
    onStartEdit,
    onConfirmEdit,
    onCancelEdit,
    onEditDesignationChange,
    editingQuestionId,
    editingQuestionIntitule,
    editingQuestionRubriqueId,
    onStartEditQuestion,
    onConfirmEditQuestion,
    onCancelEditQuestion,
    onEditQuestionIntituleChange,
    onOpenQualificatifDialog,
}: {
    rubrique: RubriqueEvaluationDTO
    isExpanded: boolean
    onToggleExpand: (id: number) => void
    evaluationId?: number
    onRemoveRubrique: (id: number) => void
    onRemoveQuestion: (rubriqueEvaluationId: number, questionEvaluationId: number) => void
    onQuestionDragEnd: (rubriqueEvaluationId: number, event: DragEndEvent) => void
    openQuestionDialog: (rubriqueEvaluationId: number) => void
    readOnly: boolean
    editingRubriqueId: number | null
    editingDesignation: string
    onStartEdit: (id: number, currentDesignation: string) => void
    onConfirmEdit: (id: number) => void
    onCancelEdit: () => void
    onEditDesignationChange: (value: string) => void
    editingQuestionId: number | null
    editingQuestionIntitule: string
    editingQuestionRubriqueId: number | null
    onStartEditQuestion: (rubriqueId: number, questionEvaluationId: number, intitule: string) => void
    onConfirmEditQuestion: (rubriqueId: number, questionEvaluationId: number) => void
    onCancelEditQuestion: () => void
    onEditQuestionIntituleChange: (value: string) => void
    onOpenQualificatifDialog: (rubriqueId: number, questionEvaluationId: number) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: rubrique.idRubriqueEvaluation.toString(),
        disabled: readOnly,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
    }

    const questions = rubrique.questions ?? []

    const questionSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const isEditing = editingRubriqueId === rubrique.idRubriqueEvaluation

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${isDragging ? "shadow-lg ring-2 ring-gray-200" : ""
                }`}
        >
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
                <div
                    {...(!readOnly ? attributes : {})}
                    {...(!readOnly ? listeners : {})}
                    className={`flex-shrink-0 touch-none ${readOnly
                        ? "cursor-default text-gray-300"
                        : "cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        }`}
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
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editingDesignation}
                                onChange={(e) => onEditDesignationChange(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onConfirmEdit(rubrique.idRubriqueEvaluation)
                                    if (e.key === "Escape") onCancelEdit()
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700"
                                onClick={() => onConfirmEdit(rubrique.idRubriqueEvaluation)}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-gray-400 hover:text-gray-600"
                                onClick={onCancelEdit}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 truncate">{rubrique.designation}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                                {rubrique.type && (
                                    <span className={`rounded-full border px-2 py-0.5 text-xs ${getRubriqueTypeStyle(rubrique.type)}`}>
                                        {getRubriqueTypeLabel(rubrique.type)}
                                    </span>
                                )}
                                <span>{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    )}
                </div>

                {!readOnly && !isEditing && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-gray-400 hover:text-blue-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            onStartEdit(rubrique.idRubriqueEvaluation, rubrique.designation ?? "")
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-400 hover:text-red-600"
                    disabled={!evaluationId || readOnly}
                    onClick={() => onRemoveRubrique(rubrique.idRubriqueEvaluation)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {isExpanded && (
                <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-3 bg-white">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Questions</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full border-dashed text-xs w-full sm:w-auto"
                            disabled={!evaluationId || readOnly}
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
                                items={questions
                                    .filter((q) => q && q.idQuestionEvaluation != null)
                                    .map((q) => q.idQuestionEvaluation.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {questions
                                        .filter((q) => q && q.idQuestion != null)
                                        .map((q) => {
                                            const questionEvaluationId = getQuestionEvalId(q)

                                            return (
                                                <SortableQuestionRow
                                                    key={questionEvaluationId}
                                                    question={q}
                                                    rubriqueEvaluationId={rubrique.idRubriqueEvaluation}
                                                    evaluationId={evaluationId}
                                                    onRemove={onRemoveQuestion}
                                                    readOnly={readOnly}
                                                    isEditing={
                                                        editingQuestionId === questionEvaluationId &&
                                                        editingQuestionRubriqueId === rubrique.idRubriqueEvaluation
                                                    }
                                                    editingIntitule={editingQuestionIntitule}
                                                    onStartEdit={(intitule) =>
                                                        onStartEditQuestion(rubrique.idRubriqueEvaluation, questionEvaluationId, intitule)
                                                    }
                                                    onConfirmEdit={() =>
                                                        onConfirmEditQuestion(rubrique.idRubriqueEvaluation, questionEvaluationId)
                                                    }
                                                    onCancelEdit={onCancelEditQuestion}
                                                    onIntituleChange={onEditQuestionIntituleChange}
                                                    onOpenQualificatif={() =>
                                                        onOpenQualificatifDialog(rubrique.idRubriqueEvaluation, questionEvaluationId)
                                                    }
                                                />
                                            )
                                        })}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            )}
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────────────── */
export function RubriquesSection({
    rubriques,
    onChange,
    evaluationId,
    onReload,
    readOnly = false,
    onEditingChange,
}: RubriquesSectionProps) {
    const [availableRubriques, setAvailableRubriques] = useState<Rubrique[]>([])
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
    const [qualificatifs, setQualificatifs] = useState<QualificatifDTO[]>([])

    const [selectedRubriqueIds, setSelectedRubriqueIds] = useState<number[]>([])
    const [isRubriqueDialogOpen, setIsRubriqueDialogOpen] = useState(false)
    const [expandedRubriqueIds, setExpandedRubriqueIds] = useState<Set<number>>(new Set())

    const [activeRubriqueEvaluationId, setActiveRubriqueEvaluationId] = useState<number | null>(null)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])
    const [selectedQuestionType, setSelectedQuestionType] = useState<"STANDARD" | "SPECIFIQUE">("STANDARD")
    const [questionSearch, setQuestionSearch] = useState("")
    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)

    // Création rubrique spécifique
    const [isSpecifiqueDialogOpen, setIsSpecifiqueDialogOpen] = useState(false)
    const [specifiqueDesignation, setSpecifiqueDesignation] = useState("")
    const [specifiqueError, setSpecifiqueError] = useState("")
    const [specifiqueLoading, setSpecifiqueLoading] = useState(false)
    const [specifiqueSelectedQuestions, setSpecifiqueSelectedQuestions] = useState<number[]>([])
    const [specifiqueQuestionSearch, setSpecifiqueQuestionSearch] = useState("")

    // Édition rubrique
    const [editingRubriqueId, setEditingRubriqueId] = useState<number | null>(null)
    const [editingDesignation, setEditingDesignation] = useState("")

    // Édition question
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
    const [editingQuestionIntitule, setEditingQuestionIntitule] = useState("")
    const [editingQuestionRubriqueId, setEditingQuestionRubriqueId] = useState<number | null>(null)

    // Édition qualificatif
    const [qualificatifDialogQuestionId, setQualificatifDialogQuestionId] = useState<number | null>(null)
    const [qualificatifDialogRubriqueId, setQualificatifDialogRubriqueId] = useState<number | null>(null)
    const [availableQualificatifs, setAvailableQualificatifs] = useState<QualificatifDTO[]>([])
    const [selectedQualificatifId, setSelectedQualificatifId] = useState<number | null>(null)
    const [isQualificatifDialogOpen, setIsQualificatifDialogOpen] = useState(false)


    const [deleteRubriqueTarget, setDeleteRubriqueTarget] = useState<number | null>(null)
    const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<{ rubriqueId: number, questionId: number } | null>(null)

    const [selectedType, setSelectedType] = useState<"RBS" | "RBP">("RBS")

    useEffect(() => {
        void loadRubriques()
        void loadQuestions()
        void loadQualificatifs()
    }, [])

    const loadRubriques = async () => {
        const data = await getRubriques()
        setAvailableRubriques(data)
    }

    const loadQuestions = async () => {
        const data = await getQuestions()
        setAvailableQuestions(data)
    }

    const loadQualificatifs = async () => {
        const data = await getQualificatifs()
        setQualificatifs(data)
    }

    const getQualificatifLabel = (idQualificatif?: number | string | null): string => {
        if (idQualificatif == null) return ""
        const qualif = qualificatifs.find((q) => getQualificatifId(q) === Number(idQualificatif))
        return qualif ? `${qualif.mot1} ↔ ${qualif.mot2}` : ""
    }

    const getScale = (idQualificatif?: number | string | null): QualificatifDTO | undefined => {
        if (idQualificatif == null) return undefined
        return qualificatifs.find((q) => getQualificatifId(q) === Number(idQualificatif))
    }

    /* ── Ajout / suppression de rubriques ────────────────────────────────────── */

    const handleAddRubrique = async () => {
        if (!selectedRubriqueIds.length || !evaluationId || readOnly) return

        try {
            await Promise.all(
                selectedRubriqueIds.map((id) => addRubriqueToEvaluation(evaluationId, id)),
            )
            if (onReload) await onReload()
            setSelectedRubriqueIds([])
            setIsRubriqueDialogOpen(false)
        } catch (error) {
            console.error("Erreur lors de l'ajout de la rubrique :", error)
            toast.error("Erreur", {
                description: "Impossible d'ajouter la ou les rubriques.",
            })
        }
    }

    const handleRemoveRubrique = async (rubriqueEvaluationId: number) => {
        if (!evaluationId || readOnly) return
        try {
            await removeRubriqueFromEvaluation(evaluationId, rubriqueEvaluationId)
            if (onReload) await onReload()
        } catch (error) {
            console.error("Erreur lors de la suppression de la rubrique :", error)
            toast.error("Erreur", {
                description: "Impossible de supprimer la rubrique.",
            })
        }
    }

    /* ── Création rubrique spécifique ────────────────────────────────────────── */

    const handleAddRubriqueSpecifique = async () => {
        if (!evaluationId || readOnly) return

        if (!specifiqueDesignation.trim()) {
            setSpecifiqueError("La désignation est obligatoire.")
            return
        }

        setSpecifiqueLoading(true)
        setSpecifiqueError("")

        try {
            const rubrique = await addRubriqueSpecifiqueToEvaluation(
                evaluationId,
                specifiqueDesignation.trim(),
            )

            for (const idQuestion of specifiqueSelectedQuestions) {
                await addQuestionToRubriqueEvaluation(
                    evaluationId,
                    rubrique.idRubriqueEvaluation,
                    idQuestion,
                )
            }

            if (onReload) await onReload()

            setIsSpecifiqueDialogOpen(false)
            toast.success("Rubrique créée", {
                description: `"${specifiqueDesignation.trim()}" a été ajoutée à l'évaluation.`
            })
            setSpecifiqueDesignation("")
            setSpecifiqueSelectedQuestions([])
            setSpecifiqueQuestionSearch("")
        } catch (error) {
            toast.error("Erreur", {
                description: "Impossible de créer la rubrique spécifique."
            })
        } finally {
            setSpecifiqueLoading(false)
        }
    }

    /* ── Ajout / suppression de questions ────────────────────────────────────── */

    const openQuestionDialog = (rubriqueEvaluationId: number) => {
        if (!evaluationId || readOnly) return
        setActiveRubriqueEvaluationId(rubriqueEvaluationId)
        setSelectedQuestionIds([])
        setQuestionSearch("")
        setSelectedQuestionType("STANDARD")
        setIsQuestionDialogOpen(true)
    }

    const handleAddQuestion = async () => {
        if (!evaluationId || !activeRubriqueEvaluationId || !selectedQuestionIds.length || readOnly) return

        try {
            await Promise.all(
                selectedQuestionIds.map((idQuestion) =>
                    addQuestionToRubriqueEvaluation(
                        evaluationId,
                        activeRubriqueEvaluationId,
                        idQuestion,
                    ),
                ),
            )
            if (onReload) await onReload()
            setIsQuestionDialogOpen(false)
            setSelectedQuestionIds([])
        } catch (error) {
            console.error("Erreur lors de l'ajout de la question :", error)
            toast.error("Erreur", {
                description: "Impossible d'ajouter la ou les questions.",
            })
        }
    }

    const handleRemoveQuestion = async (rubriqueEvaluationId: number, questionEvaluationId: number) => {
        if (!evaluationId || readOnly) return

        try {
            await removeQuestionFromRubriqueEvaluation(
                evaluationId,
                rubriqueEvaluationId,
                questionEvaluationId,
            )
            if (onReload) await onReload()
        } catch (error) {
            console.error("Erreur lors de la suppression de la question :", error)
            toast.error("Erreur", {
                description: "Impossible de supprimer la question.",
            })
        }
    }

    /* ── Édition rubrique ─────────────────────────────────────────────────────── */

    const handleStartEditRubrique = (id: number, currentDesignation: string) => {
        setEditingRubriqueId(id)
        setEditingDesignation(currentDesignation)
        onEditingChange?.(true)
    }

    const handleCancelEditRubrique = () => {
        setEditingRubriqueId(null)
        setEditingDesignation("")
        onEditingChange?.(false)
    }

    const handleConfirmEditRubrique = async (rubriqueEvaluationId: number) => {
        if (!evaluationId) return

        const nextDesignation = editingDesignation.trim()

        if (!nextDesignation) {
            toast.error("Champ obligatoire", {
                description: "Veuillez insérer un nom pour la désignation.",
                style: { background: "#991b1b", color: "#fff", border: "none" },
            })
            return
        }

        const currentRubrique = rubriques.find((r) => r.idRubriqueEvaluation === rubriqueEvaluationId)

        if (!currentRubrique) return

        if ((currentRubrique.designation ?? "") === nextDesignation) {
            handleCancelEditRubrique()
            return
        }

        try {
            if (currentRubrique.type === "SPECIFIQUE") {
                await updateRubriqueSpecifique(evaluationId, rubriqueEvaluationId, nextDesignation)
            } else {
                await updateDesignationRubriqueEvaluation(evaluationId, rubriqueEvaluationId, nextDesignation)
            }

            toast.success("Désignation de rubrique mise à jour", {
                description: `"${nextDesignation}" a été sauvegardée avec succès.`,
                style: { background: "#166534", color: "#fff", border: "none" },
            })

            if (onReload) await onReload()
            handleCancelEditRubrique()
        } catch (error) {
            toast.error("Erreur", {
                description: "Impossible de modifier la désignation de la rubrique.",
                style: { background: "#991b1b", color: "#fff", border: "none" },
            })
            onEditingChange?.(false)
            console.error("Erreur lors de la modification de la désignation :", error)
        }
    }

    /* ── Édition intitulé question ───────────────────────────────────────────── */

    const handleStartEditQuestion = (
        rubriqueId: number,
        questionEvaluationId: number,
        currentIntitule: string,
    ) => {
        setEditingQuestionRubriqueId(rubriqueId)
        setEditingQuestionId(questionEvaluationId)
        setEditingQuestionIntitule(currentIntitule)
        onEditingChange?.(true)
    }

    const handleCancelEditQuestion = () => {
        setEditingQuestionId(null)
        setEditingQuestionIntitule("")
        setEditingQuestionRubriqueId(null)
        onEditingChange?.(false)
    }

    const handleConfirmEditQuestion = async (
        rubriqueEvaluationId: number,
        questionEvaluationId: number,
    ) => {
        if (!evaluationId) return

        const nextIntitule = editingQuestionIntitule.trim()

        if (!nextIntitule) {
            toast.error("Champ obligatoire", {
                description: "Veuillez insérer un intitulé pour la question.",
                style: { background: "#991b1b", color: "#fff", border: "none" },
            })
            return
        }

        const rubrique = rubriques.find((r) => r.idRubriqueEvaluation === rubriqueEvaluationId)
        const currentQuestion = rubrique?.questions.find(
            (q) => getQuestionEvalId(q) === questionEvaluationId,
        )

        if (currentQuestion?.intitule === nextIntitule) {
            handleCancelEditQuestion()
            return
        }

        try {
            await updateIntituleQuestionEvaluation(
                evaluationId,
                rubriqueEvaluationId,
                questionEvaluationId,
                nextIntitule,
            )

            toast.success("Intitulé mis à jour", {
                description: `"${nextIntitule}" a été sauvegardé.`,
                style: { background: "#166534", color: "#fff", border: "none" },
            })

            if (onReload) await onReload()
            handleCancelEditQuestion()
        } catch (error) {
            toast.error("Erreur", {
                description: "Impossible de modifier l'intitulé.",
                style: { background: "#991b1b", color: "#fff", border: "none" },
            })
            onEditingChange?.(false)
            console.error("Erreur lors de la modification de l'intitulé :", error)
        }
    }

    /* ── Édition qualificatif question ───────────────────────────────────────── */

    const openQualificatifDialog = async (rubriqueId: number, questionEvaluationId: number) => {
        const data = await getQualificatifs()

        const rubrique = rubriques.find((r) => r.idRubriqueEvaluation === rubriqueId)
        const question = rubrique?.questions.find(
            (q) => getQuestionEvalId(q) === questionEvaluationId,
        )
        const rawId = question?.idQualificatif
        const currentId = rawId != null ? Number(rawId) : null

        setAvailableQualificatifs(data)
        setQualificatifDialogRubriqueId(rubriqueId)
        setQualificatifDialogQuestionId(questionEvaluationId)
        setSelectedQualificatifId(currentId && !Number.isNaN(currentId) ? currentId : null)
        setIsQualificatifDialogOpen(true)
    }

    const handleConfirmQualificatif = async () => {
        const evalId = evaluationId
        const rubriqueId = qualificatifDialogRubriqueId
        const questionId = qualificatifDialogQuestionId
        const qualifId = selectedQualificatifId

        if (!evalId || !rubriqueId || !questionId || !qualifId) {
            console.warn("Guard failed:", { evalId, rubriqueId, questionId, qualifId })
            return
        }

        try {
            await updateQualificatifQuestionEvaluation(evalId, rubriqueId, questionId, qualifId)

            toast.success("Qualificatif mis à jour", {
                style: { background: "#166534", color: "#fff", border: "none" },
            })

            setIsQualificatifDialogOpen(false)
            setQualificatifDialogRubriqueId(null)
            setQualificatifDialogQuestionId(null)
            setSelectedQualificatifId(null)

            if (onReload) await onReload()
        } catch (err) {
            console.error("Erreur updateQualificatif:", err)
            toast.error("Erreur", {
                description: "Impossible de modifier le qualificatif.",
                style: { background: "#991b1b", color: "#fff", border: "none" },
            })
        }
    }

    /* ── Accordion / sélection ───────────────────────────────────────────────── */

    const toggleRubriqueExpanded = useCallback((id: number) => {
        setExpandedRubriqueIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const toggleRubriqueSelection = (id: number) => {
        setSelectedRubriqueIds((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
        )
    }

    /* ── Drag & drop ─────────────────────────────────────────────────────────── */

    const rubriqueSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const handleRubriqueDragEnd = useCallback(
        async (event: DragEndEvent) => {
            if (readOnly) return

            const { active, over } = event
            if (!over || active.id === over.id || !evaluationId || !rubriques?.length) return

            const oldIndex = rubriques.findIndex((r) => r.idRubriqueEvaluation.toString() === active.id)
            const newIndex = rubriques.findIndex((r) => r.idRubriqueEvaluation.toString() === over.id)

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
        [evaluationId, rubriques, onReload, onChange, readOnly],
    )

    const handleQuestionDragEnd = useCallback(
        async (rubriqueEvaluationId: number, event: DragEndEvent) => {
            if (readOnly) return

            const { active, over } = event
            if (!over || active.id === over.id || !evaluationId) return

            const rubrique = rubriques?.find((r) => r.idRubriqueEvaluation === rubriqueEvaluationId)
            if (!rubrique?.questions?.length) return

            const questions = rubrique.questions

            const oldIndex = questions.findIndex(
                (q) => q.idQuestionEvaluation.toString() === active.id,
            )
            const newIndex = questions.findIndex(
                (q) => q.idQuestionEvaluation.toString() === over.id,
            )

            if (oldIndex === -1 || newIndex === -1) return

            const reordered = arrayMove(questions, oldIndex, newIndex)

            const updatedRubriques = rubriques.map((r) =>
                r.idRubriqueEvaluation === rubriqueEvaluationId
                    ? { ...r, questions: reordered }
                    : r,
            )

            onChange(updatedRubriques)

            const questionOrders = reordered.map((q, i) => ({
                idQuestionEvaluation: getQuestionEvalId(q),
                ordre: i + 1,
            }))

            try {
                await reorderQuestionsInRubriqueEvaluation(evaluationId, rubriqueEvaluationId, { questionOrders })
                if (onReload) await onReload()
            } catch (err) {
                console.error("Erreur réordonnancement questions :", err)
            }
        },
        [evaluationId, rubriques, onReload, onChange, readOnly],
    )

    /* ── Filtres ─────────────────────────────────────────────────────────────── */

    const filteredQuestions = availableQuestions.filter((q) => {
  if (!activeRubriqueEvaluationId) return false

  const rubrique = rubriques.find(
    (r) => r.idRubriqueEvaluation === activeRubriqueEvaluationId
  )

  const alreadyUsedIds = new Set(
    (rubrique?.questions || []).map((qq) => getQuestionCatalogId(qq))
  )

  const matchesSearch = q.intitule
    .toLowerCase()
    .includes(questionSearch.toLowerCase())

  // 🔥 FILTRE TYPE
  const matchesType =
    selectedQuestionType === "STANDARD"
      ? q.type !== "SPECIFIQUE"
      : q.type === "SPECIFIQUE"

  return !alreadyUsedIds.has(q.idQuestion) && matchesSearch && matchesType
})

    const usedRubriqueIds = new Set((rubriques ?? []).map((r) => r.idRubrique))
    const filteredRubriques = availableRubriques
        .filter((r) => !usedRubriqueIds.has(r.idRubrique))
        .filter((r) => r.type === selectedType)
    const sortedRubriques = [...filteredRubriques].sort((a, b) =>
        a.designation.localeCompare(b.designation),
    )

    /* ── Render ──────────────────────────────────────────────────────────────── */

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 min-w-0">
            {/* HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-gray-900 truncate">
                    Rubriques de l&apos;évaluation
                </h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {/* Bouton rubrique spécifique */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!evaluationId || readOnly}
                                        className="rounded-full w-full sm:w-auto shrink-0 border-dashed text-purple-600 border-purple-300 hover:bg-purple-50"
                                        onClick={() => {
                                            setSpecifiqueDesignation("")
                                            setSpecifiqueError("")
                                            setSpecifiqueSelectedQuestions([])
                                            setSpecifiqueQuestionSearch("")
                                            setIsSpecifiqueDialogOpen(true)
                                        }}
                                    >
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Rubrique spécifique
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!evaluationId && (
                                <TooltipContent>
                                    Enregistrez d'abord les informations de l'évaluation.
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    {/* Bouton rubrique catalogue */}
                    <Dialog open={isRubriqueDialogOpen} onOpenChange={setIsRubriqueDialogOpen}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-auto">
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedType("RBS")   // 👈 AJOUTE ÇA
                                                    setIsRubriqueDialogOpen(true)
                                                }}
                                                variant="outline"
                                                size="sm"
                                                disabled={!evaluationId || readOnly}
                                                className="rounded-full w-full sm:w-auto shrink-0"
                                            >
                                                <Plus className="mr-1.5 h-4 w-4" />
                                                Ajouter une rubrique
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                </TooltipTrigger>
                                {!evaluationId && (
                                    <TooltipContent>
                                        Enregistrez d'abord les informations de l'évaluation.
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

                        <DialogContent className="w-[98vw] max-w-4xl max-h-[90vh] flex flex-col">
                            <DialogHeader className="pb-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <LayoutList className="h-5 w-5 shrink-0" />
                                    <DialogTitle className="text-lg font-semibold text-gray-900">
                                        Ajouter une rubrique à l&apos;évaluation
                                    </DialogTitle>
                                </div>
                                <p className="text-sm text-gray-500 font-normal mt-1">
                                    Choisissez une ou plusieurs rubriques dans le catalogue. Elles seront ajoutées avec leurs questions existantes.
                                </p>
                            </DialogHeader>

                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setSelectedType("RBS")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "RBS"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    Standard
                                </button>

                                <button
                                    onClick={() => setSelectedType("RBP")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "RBP"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    Personnel
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-gray-200/90 bg-gray-50/30 p-2 sm:p-3">
                                <div className="grid gap-2 sm:gap-3">

                                    {sortedRubriques.map((r) => {
                                        const isSelected = selectedRubriqueIds.includes(r.idRubrique)
                                        const questionCount = Array.isArray(r.questions) ? r.questions.length : 0

                                        return (
                                            <button
                                                key={r.idRubrique}
                                                type="button"
                                                onClick={() => toggleRubriqueSelection(r.idRubrique)}
                                                className={`group relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 ${isSelected
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
                                                        <span className={`rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-600 ${getRubriqueTypeStyle(r.type)}`}>
                                                            {questionCount} question{questionCount !== 1 ? "s" : ""}
                                                        </span>
                                                        {r.type && <span className="text-gray-400">{getRubriqueTypeLabel(r.type)}</span>}
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
                                    disabled={selectedRubriqueIds.length === 0}
                                    className="order-1 sm:order-2 w-full sm:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter à l&apos;évaluation
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
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
                                readOnly={readOnly}
                                editingRubriqueId={editingRubriqueId}
                                editingDesignation={editingDesignation}
                                onStartEdit={handleStartEditRubrique}
                                onConfirmEdit={handleConfirmEditRubrique}
                                onCancelEdit={handleCancelEditRubrique}
                                onEditDesignationChange={setEditingDesignation}
                                editingQuestionId={editingQuestionId}
                                editingQuestionIntitule={editingQuestionIntitule}
                                editingQuestionRubriqueId={editingQuestionRubriqueId}
                                onStartEditQuestion={handleStartEditQuestion}
                                onConfirmEditQuestion={handleConfirmEditQuestion}
                                onCancelEditQuestion={handleCancelEditQuestion}
                                onEditQuestionIntituleChange={setEditingQuestionIntitule}
                                onOpenQualificatifDialog={openQualificatifDialog}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Dialog création rubrique spécifique */}
            <Dialog open={isSpecifiqueDialogOpen} onOpenChange={setIsSpecifiqueDialogOpen}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Créer une rubrique spécifique</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2 flex-1 overflow-y-auto">
                        <p className="text-sm text-gray-500">
                            Cette rubrique sera propre à cette évaluation et ne sera pas ajoutée au catalogue.
                        </p>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Désignation <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Ex: Ambiance générale du cours"
                                value={specifiqueDesignation}
                                onChange={(e) => {
                                    setSpecifiqueDesignation(e.target.value)
                                    if (e.target.value.trim()) setSpecifiqueError("")
                                }}
                                className="h-9 text-sm"
                                autoFocus
                            />
                            {specifiqueError && <p className="text-xs text-red-500">{specifiqueError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Questions <span className="text-gray-400 font-normal">(optionnel)</span>
                            </label>

                            <Input
                                placeholder="Rechercher une question..."
                                value={specifiqueQuestionSearch}
                                onChange={(e) => setSpecifiqueQuestionSearch(e.target.value)}
                                className="h-9 text-sm"
                            />

                            <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200">
                                {availableQuestions
                                    .filter((q) =>
                                        q.intitule.toLowerCase().includes(specifiqueQuestionSearch.toLowerCase()),
                                    )
                                    .map((q) => {
                                        const isSelected = specifiqueSelectedQuestions.includes(q.idQuestion)
                                        const qualifLabel = getQualificatifLabel(q.idQualificatif)

                                        return (
                                            <div
                                                key={q.idQuestion}
                                                onClick={() => {
                                                    setSpecifiqueSelectedQuestions((prev) =>
                                                        isSelected
                                                            ? prev.filter((id) => id !== q.idQuestion)
                                                            : [...prev, q.idQuestion],
                                                    )
                                                }}
                                                className={`cursor-pointer border-b border-gray-100 px-3 py-2.5 text-sm transition select-none ${isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className={`truncate ${isSelected ? "font-medium text-blue-800" : "text-gray-800"}`}>
                                                        {q.intitule}
                                                    </span>
                                                    {qualifLabel && (
                                                        <span className="shrink-0 text-xs text-gray-400 italic">
                                                            {qualifLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                {availableQuestions.filter((q) =>
                                    q.intitule.toLowerCase().includes(specifiqueQuestionSearch.toLowerCase()),
                                ).length === 0 && (
                                        <div className="px-3 py-4 text-center text-sm text-gray-400">
                                            Aucune question trouvée.
                                        </div>
                                    )}
                            </div>

                            {specifiqueSelectedQuestions.length > 0 && (
                                <p className="text-xs text-blue-600">
                                    {specifiqueSelectedQuestions.length} question
                                    {specifiqueSelectedQuestions.length > 1 ? "s" : ""} sélectionnée
                                    {specifiqueSelectedQuestions.length > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t border-gray-100 pt-3 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSpecifiqueDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddRubriqueSpecifique}
                            disabled={specifiqueLoading || !specifiqueDesignation.trim()}
                        >
                            {specifiqueLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                "Créer la rubrique"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog ajout de questions */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajouter une question à la rubrique</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setSelectedQuestionType("STANDARD")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedQuestionType === "STANDARD"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            Standard
                        </button>

                        <button
                            onClick={() => setSelectedQuestionType("PERSONNEL")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedQuestionType === "PERSONNEL"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            Personnel
                        </button>
                    </div>

                    <div className="space-y-3 py-2">
                        <Input
                            placeholder="Rechercher une question..."
                            value={questionSearch}
                            onChange={(e) => setQuestionSearch(e.target.value)}
                            className="h-9 text-sm"
                        />

                        <div className="text-xs text-gray-500">
                            {selectedQuestionIds.length} question(s) sélectionnée(s)
                        </div>

                        <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-gray-50 p-3">
                            <div className="grid grid-cols-1 gap-2">
                                {filteredQuestions.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                                        Aucune question disponible.
                                    </div>
                                ) : (
                                    filteredQuestions.map((q) => {
                                        const scale = getScale(q.idQualificatif)
                                        const isSelected = selectedQuestionIds.includes(q.idQuestion)

                                        return (
                                            <div
                                                key={q.idQuestion}
                                                onClick={() => {
                                                    setSelectedQuestionIds((prev) =>
                                                        prev.includes(q.idQuestion)
                                                            ? prev.filter((id) => id !== q.idQuestion)
                                                            : [...prev, q.idQuestion],
                                                    )
                                                }}
                                                className={`cursor-pointer rounded-lg border p-3 text-sm transition flex items-center justify-between ${isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span className="text-gray-800">{q.intitule}</span>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {scale ? `${scale.mot1} ↔ ${scale.mot2}` : "Échelle non définie"}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={handleAddQuestion}
                            disabled={selectedQuestionIds.length === 0}
                            className="w-full"
                        >
                            Ajouter {selectedQuestionIds.length} question(s)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog qualificatif */}
            <Dialog open={isQualificatifDialogOpen} onOpenChange={setIsQualificatifDialogOpen}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le qualificatif</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="max-h-72 overflow-y-auto rounded-md border border-gray-200">
                            {availableQualificatifs.map((qualif) => {
                                const qualifId = getQualificatifId(qualif)
                                const isSelected = selectedQualificatifId === qualifId

                                return (
                                    <div
                                        key={qualifId}
                                        onClick={() => setSelectedQualificatifId(qualifId)}
                                        className={`cursor-pointer border-b border-gray-100 px-3 py-2.5 text-sm transition ${isSelected ? "bg-blue-50 text-blue-800" : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        {qualif.mot1} ↔ {qualif.mot2}
                                    </div>
                                )
                            })}

                            {availableQualificatifs.length === 0 && (
                                <div className="px-4 py-6 text-center text-sm text-gray-400">
                                    Aucun qualificatif disponible.
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsQualificatifDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmQualificatif}
                            disabled={!selectedQualificatifId}
                        >
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}