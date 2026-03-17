import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, BarChart2 } from "lucide-react"

import { Button } from "../../components/ui/button"

import { EvaluationHeaderView } from "../../components/evaluations/EvaluationHeaderView"
import { RubriquesView } from "../../components/evaluations/RubriquesView"

import {
  getEvaluation,
  getEvaluationFull,
  type EvaluationDetailDTO,
  type RubriqueEvaluationDTO
} from "../../services/EvaluationService"



export function EvaluationDetailPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [evaluation, setEvaluation] =
    useState<EvaluationDetailDTO | null>(null)

  const [rubriques, setRubriques] =
    useState<RubriqueEvaluationDTO[]>([])

  const [loading, setLoading] = useState(true)


  useEffect(() => {

    if (id) loadEvaluation(Number(id))

  }, [id])


  const loadEvaluation = async (evaluationId: number) => {

    try {

      setLoading(true)

      const data = await getEvaluationFull(evaluationId)

setEvaluation(data)
setRubriques(data.rubriques)

    } catch (error) {

      console.error("Erreur chargement :", error)

    } finally {

      setLoading(false)

    }

  }


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }


  if (!evaluation) {
    return (
      <div className="text-center text-gray-500">
        Évaluation introuvable
      </div>
    )
  }

const isClosed = evaluation?.etat === "CLO"
  return (

    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-bold text-gray-900">
          {`${evaluation.designation}`}
        </h1>

      <div className="flex items-center gap-3">
        <div className="relative group">
          <Button
            variant="default"
            disabled={!isClosed}
            onClick={() => navigate(`/evaluations/${id}/statistiques`)}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart2 className="h-4 w-4" />
            Consulter les statistiques
          </Button>
          {!isClosed && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-md bg-gray-900 text-white text-xs text-center px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Les statistiques sont disponibles uniquement lorsque l'évaluation est clôturée.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate("/evaluations")}>
          Retour
        </Button>
      </div>

      </div>


      <EvaluationHeaderView evaluation={evaluation} onReload={() => loadEvaluation(Number(id))}/>

      <RubriquesView rubriques={rubriques} />


    </div>

  )
}