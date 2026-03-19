import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle, Star } from "lucide-react"
import { getEvaluationResult, type ReponseEvaluationResultDTO } from "@/services/EvaluationDetailService"
import { toast } from "sonner"

export default function VoirResultatPage() {
  const { idEvaluation } = useParams<{ idEvaluation: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReponseEvaluationResultDTO | null>(null)

  useEffect(() => {
    const fetchResult = async () => {
      if (!idEvaluation) return

      try {
        setLoading(true)
        console.log("[DEBUG][VoirResultat] Chargement résultat", { idEvaluation })
        const data = await getEvaluationResult(Number(idEvaluation))
        console.log("[DEBUG][VoirResultat] Données résultat reçues", {
          idEvaluation: data.idEvaluation,
          designation: data.designation,
          rubriquesCount: data.rubriques?.length || 0,
          commentaireLength: data.commentaire?.length || 0,
        })

        data.rubriques?.forEach((rubrique, index) => {
          console.log("[DEBUG][VoirResultat] Rubrique", {
            index,
            idRubriqueEvaluation: rubrique.idRubriqueEvaluation,
            designation: rubrique.designation,
            questionsCount: rubrique.questions?.length || 0,
          })

          rubrique.questions?.forEach((question, qIndex) => {
            console.log("[DEBUG][VoirResultat] Question", {
              rubriqueIndex: index,
              questionIndex: qIndex,
              idQuestionEvaluation: question.idQuestionEvaluation,
              intitule: question.intitule,
              positionnement: question.positionnement,
              minimal: question.minimal,
              maximal: question.maximal,
            })
          })
        })

        setResult(data)
      } catch (e: any) {
        console.error("[DEBUG][VoirResultat] Erreur chargement résultat", e)
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

  // Exclure les questions sans intitulé (null/vide) avant l'affichage des résultats
  const rubriquesAvecQuestions =
    result?.rubriques
      ?.map((rubrique) => ({
        ...rubrique,
        questions: (rubrique.questions || []).filter(
          (q) => (q?.intitule ?? "").trim().length > 0,
        ),
      }))
      .filter((rubrique) => (rubrique.questions || []).length > 0) || []

  useEffect(() => {
    if (!result) return

    const totalQuestions = rubriquesAvecQuestions.reduce(
      (acc, rubrique) => acc + (rubrique.questions?.length || 0),
      0,
    )

    console.log("[DEBUG][VoirResultat] Résumé affichage", {
      idEvaluation: result.idEvaluation,
      rubriquesAffichees: rubriquesAvecQuestions.length,
      totalQuestionsAffichees: totalQuestions,
      hasCommentaire: Boolean(result.commentaire),
    })
  }, [result, rubriquesAvecQuestions])

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
              <span className="font-semibold text-gray-700">Unité d'enseignement :</span>{" "}
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
        </div>
      </div>

      {/* Toutes les rubriques affichées */}
      {rubriquesAvecQuestions.map((rubrique, rubriqueIndex) => (
        <div key={rubrique.idRubriqueEvaluation} className="mb-3 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            {rubrique.designation || `Rubrique ${rubriqueIndex + 1}`}
          </h2>

          {!rubrique.questions || rubrique.questions.length === 0 ? (
            <p className="text-gray-500 italic">Aucune question dans cette rubrique</p>
          ) : (
            <div className="space-y-2">
              {rubrique.questions.map((question) => (
                <div key={question.idQuestionEvaluation} className="pb-2 border-b border-gray-100 last:border-b-0">
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {question.intitule}
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <span className="w-28 text-base font-semibold text-gray-700 text-right whitespace-nowrap">
                      {question.minimal || "Pas du tout"}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renderStars(question.positionnement)}
                    </div>
                    <span className="w-28 text-base font-semibold text-gray-700 whitespace-nowrap">
                      {question.maximal || "Tout à fait"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

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
