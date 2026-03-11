import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle, Star } from "lucide-react"
import { getEvaluationResult, ReponseEvaluationResultDTO } from "@/services/EvaluationDetailService"
import { toast } from "sonner"

export default function VoirResultatPage() {
  const { idEvaluation } = useParams<{ idEvaluation: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReponseEvaluationResultDTO | null>(null)
  const [currentRubriqueIndex, setCurrentRubriqueIndex] = useState(0)

  useEffect(() => {
    const fetchResult = async () => {
      if (!idEvaluation) return

      try {
        setLoading(true)
        const data = await getEvaluationResult(Number(idEvaluation))
        setResult(data)
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement du résultat")
        toast.error(e.message || "Erreur lors du chargement du résultat")
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [idEvaluation])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  // Rendu des étoiles selon le positionnement
  const renderStars = (positionnement: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= positionnement
      const color = positionnement === 1 
        ? "text-red-500" 
        : positionnement === 5 
        ? "text-green-500" 
        : positionnement >= 3
        ? "text-yellow-500"
        : "text-orange-500"
      
      stars.push(
        <Star
          key={i}
          className={`h-6 w-6 ${isActive ? `${color} fill-current` : "text-gray-300"}`}
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement du résultat...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">{error || "Résultat non trouvé"}</p>
          <Button onClick={() => navigate("/mes-evaluations")}>
            Retour aux évaluations
          </Button>
        </div>
      </div>
    )
  }

  // Filtrer les rubriques qui ont au moins une question
  const rubriquesAvecQuestions = result.rubriques?.filter(rubrique => {
    const questions = rubrique.questions || []
    return questions.length > 0
  }) || []

  if (!result || !rubriquesAvecQuestions || rubriquesAvecQuestions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">Aucune rubrique disponible</p>
          <Button onClick={() => navigate("/mes-evaluations")}>
            Retour aux évaluations
          </Button>
        </div>
      </div>
    )
  }

  const currentRubrique = rubriquesAvecQuestions[currentRubriqueIndex]
  const isFirstRubrique = currentRubriqueIndex === 0
  const isLastRubrique = currentRubriqueIndex === rubriquesAvecQuestions.length - 1
  const totalRubriques = rubriquesAvecQuestions.length

  const goToPreviousRubrique = () => {
    if (!isFirstRubrique) {
      setCurrentRubriqueIndex(currentRubriqueIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToNextRubrique = () => {
    if (!isLastRubrique) {
      setCurrentRubriqueIndex(currentRubriqueIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRubriqueClick = (index: number) => {
    setCurrentRubriqueIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentRubriqueQuestions = currentRubrique.questions || []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
      {/* En-tête */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/mes-evaluations")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {result.designation}
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Enseignant :</span>{" "}
              <span className="text-gray-600">
                {result.prenomEnseignant} {result.nomEnseignant}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">UE :</span>{" "}
              <span className="text-gray-600">
                {result.codeUe} ({result.codeEc})
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">N° Évaluation :</span>{" "}
              <span className="text-gray-600">{result.noEvaluation}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Date limite :</span>{" "}
              <span className="text-gray-600">{formatDate(result.finReponse)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Progression par rubrique */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-600">
                Rubrique {currentRubriqueIndex + 1} sur {rubriquesAvecQuestions.length}
              </span>
              <div className="flex gap-1">
                {rubriquesAvecQuestions.map((rubrique, index) => {
                  const isCurrent = index === currentRubriqueIndex
                  
                  return (
                    <button
                      key={rubrique.idRubriqueEvaluation}
                      onClick={() => handleRubriqueClick(index)}
                      className={`
                        h-2 w-8 rounded-full transition-all cursor-pointer hover:opacity-75
                        ${isCurrent ? "bg-blue-600 ring-2 ring-blue-300 ring-offset-2" : "bg-gray-400"}
                      `}
                      title={rubrique.designation || `Rubrique ${index + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rubrique actuelle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          {currentRubrique.designation || `Rubrique ${currentRubriqueIndex + 1}`}
        </h2>

        {!currentRubriqueQuestions || currentRubriqueQuestions.length === 0 ? (
          <p className="text-gray-500 italic">Aucune question dans cette rubrique</p>
        ) : (
          <div className="space-y-6">
            {currentRubriqueQuestions.map((question) => (
              <div key={question.idQuestionEvaluation} className="space-y-2 pb-6 border-b border-gray-100 last:border-b-0">
                <p className="text-base font-semibold text-gray-900">
                  {question.intitule}
                </p>

                {/* Étoiles et qualificatifs sur la même ligne avec grid */}
                <div className="grid grid-cols-3 items-center gap-4 py-2">
                  {/* Qualificatif minimal */}
                  <span className="text-sm font-semibold text-gray-600 text-left">
                    {question.minimal || "Pas du tout"}
                  </span>
                  
                  {/* Étoiles au centre */}
                  <div className="flex items-center justify-center gap-1">
                    {renderStars(question.positionnement)}
                  </div>
                  
                  {/* Qualificatif maximal */}
                  <span className="text-sm font-semibold text-gray-600 text-right">
                    {question.maximal || "Tout à fait"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boutons de navigation */}
        {totalRubriques > 1 && (
          <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={goToPreviousRubrique}
              disabled={isFirstRubrique}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            <Button
              onClick={goToNextRubrique}
              disabled={isLastRubrique}
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Commentaire */}
      {result.commentaire && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Mon commentaire
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {result.commentaire}
          </p>
        </div>
      )}
    </div>
  )
}
