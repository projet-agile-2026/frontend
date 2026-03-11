import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

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

      const evalData = await getEvaluation(evaluationId)

      const rubriquesData = await getEvaluationFull(evaluationId)

      setEvaluation(evalData)

      setRubriques(rubriquesData.rubriques)

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


  return (

    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-bold text-gray-900">
          {`${evaluation.designation}`}
        </h1>

        <Button
          variant="outline"
          onClick={() => navigate("/evaluations")}
        >
          Retour
        </Button>

      </div>


      <EvaluationHeaderView evaluation={evaluation} onReload={() => loadEvaluation(Number(id))}/>

      <RubriquesView rubriques={rubriques} />


    </div>

  )
}