import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import type {
    RubriqueEvaluationDTO
} from "../../services/EvaluationService"

interface Props {
    rubriques: RubriqueEvaluationDTO[]
}

export function RubriquesView({ rubriques }: Props) {

    const [expanded, setExpanded] = useState<Set<number>>(new Set())

    const toggle = (id: number) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    if (!rubriques || rubriques.length === 0) {
        return (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                    Aucune rubrique associée à cette évaluation.
                </p>
            </div>
        )
    }

    function getRubriqueTypeLabel(type?: string) {
        switch (type) {
            case "RBS":
                return "Rubrique standard"
            case "RBP":
                return "Rubrique personnalisée"
            default:
                return type ?? ""
        }
    }

    function getRubriqueTypeStyle(type?: string) {
        switch (type) {
            case "RBS":
                return "bg-blue-50 text-blue-700 border-blue-200"
            case "RBP":
                return "bg-purple-50 text-purple-700 border-purple-200"
            default:
                return "bg-gray-100 text-gray-600 border-gray-200"
        }
    }

    return (

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">

            <h2 className="text-base font-semibold text-gray-900">
                Rubriques de l'évaluation
            </h2>

            <div className="space-y-3">

                {rubriques.map((rubrique) => {

                    const isOpen = expanded.has(rubrique.idRubriqueEvaluation)
                    const questions = rubrique.questions ?? []

                    return (

                        <div
                            key={rubrique.idRubriqueEvaluation}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                        >

                            {/* HEADER */}

                            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3">

                                <button
                                    onClick={() => toggle(rubrique.idRubriqueEvaluation)}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                >
                                    {isOpen
                                        ? <ChevronDown className="h-5 w-5" />
                                        : <ChevronRight className="h-5 w-5" />
                                    }
                                </button>

                                <div className="flex-1">

                                    <h3 className="text-base font-semibold text-gray-900">
                                        {rubrique.designation}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">

                                        {rubrique.type && (
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getRubriqueTypeStyle(rubrique.type)}`}
                                            >
                                                {getRubriqueTypeLabel(rubrique.type)}
                                            </span>
                                        )}

                                        <span>
                                            {questions.length} question{questions.length !== 1 ? "s" : ""}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* QUESTIONS */}

                            {isOpen && (

                                <div className="px-4 py-4 space-y-2">

                                    {questions.length === 0 && (

                                        <div className="text-sm text-gray-400">
                                            Aucune question dans cette rubrique.
                                        </div>

                                    )}

                                    {questions.map((q) => (

                                        <div
                                            key={q.idQuestionEvaluation}
                                            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm"
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

    )

}