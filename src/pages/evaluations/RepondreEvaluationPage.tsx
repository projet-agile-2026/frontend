import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, Send, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { 
  getEvaluationDetail, 
  submitReponses, 
  type EvaluationDetailDTO, 
  type ReponseQuestionDTO 
} from "../../services/EvaluationDetailService"
import { toast } from "sonner"

export function RepondreEvaluationPage() {
  const { idEvaluation } = useParams<{ idEvaluation: string }>()
  const navigate = useNavigate()
  
  const [evaluation, setEvaluation] = useState<EvaluationDetailDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [reponses, setReponses] = useState<Map<number, number>>(new Map())
  const [commentaire, setCommentaire] = useState("")
  const [currentRubriqueIndex, setCurrentRubriqueIndex] = useState(0)

  useEffect(() => {
    if (!idEvaluation) return

    const loadEvaluation = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("🔄 Chargement de l'évaluation ID:", idEvaluation)
        const data = await getEvaluationDetail(Number(idEvaluation))
        console.log("✅ Données reçues:", data)
        console.log("📋 Nombre de rubriques:", data.rubriques?.length || 0)
        
        if (data.rubriques) {
          data.rubriques.forEach((rubrique, index) => {
            console.log(`  Rubrique ${index + 1}:`, rubrique.designation)
            console.log(`    Questions:`, rubrique.questions?.length || 0)
            rubrique.questions?.forEach((q, qIndex) => {
              console.log(`      Q${qIndex + 1}:`, q.intitule)
            })
          })
        } else {
          console.warn("⚠️ Aucune rubrique dans la réponse")
        }
        
        setEvaluation(data)
      } catch (e: any) {
        console.error("❌ Erreur lors du chargement:", e)
        setError(e.message || "Erreur lors du chargement de l'évaluation.")
      } finally {
        setLoading(false)
      }
    }

    loadEvaluation()
  }, [idEvaluation])

  const handlePositionnementChange = (idQuestionEvaluation: number, value: number) => {
    setReponses(new Map(reponses.set(idQuestionEvaluation, value)))
  }

  const handleSubmit = async () => {
    if (!evaluation) return

    // Vérifier que toutes les questions ont une réponse
    const allQuestions = evaluation.rubriques.flatMap(r => r.questions)
    const unansweredQuestions = allQuestions.filter(q => !reponses.has(q.idQuestionEvaluation))

    if (unansweredQuestions.length > 0) {
      toast.error("Veuillez répondre à toutes les questions avant de soumettre")
      return
    }

    try {
      setSubmitting(true)
      
      // Trim le commentaire (enlever espaces début/fin)
      const commentaireTrimmed = commentaire.trim()
      
      // Vérifier la longueur max de 512 caractères
      if (commentaireTrimmed.length > 512) {
        toast.error("Le commentaire ne peut pas dépasser 512 caractères")
        setSubmitting(false)
        return
      }
      
      const reponsesArray: ReponseQuestionDTO[] = Array.from(reponses.entries()).map(
        ([idQuestionEvaluation, positionnement]) => ({
          idQuestionEvaluation,
          positionnement,
        })
      )

      await submitReponses({
        idEvaluation: evaluation.idEvaluation,
        commentaire: commentaireTrimmed,
        reponses: reponsesArray,
      })

      toast.success("Vos réponses ont été enregistrées avec succès")
      navigate("/mes-evaluations")
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement des réponses")
    } finally {
      setSubmitting(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement de l'évaluation...</p>
        </div>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">{error || "Évaluation non trouvée"}</p>
          <Button onClick={() => navigate("/mes-evaluations")}>
            Retour aux évaluations
          </Button>
        </div>
      </div>
    )
  }

  // Filtrer les rubriques qui ont au moins une question
  const rubriquesAvecQuestions = evaluation?.rubriques?.filter(rubrique => {
    const questions = rubrique.questions || []
    return questions.length > 0
  }) || []

  if (!evaluation || !rubriquesAvecQuestions || rubriquesAvecQuestions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">{error || "Aucune rubrique disponible"}</p>
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
  
  // Vérifier si toutes les questions de la rubrique actuelle sont répondues
  const currentRubriqueQuestions = currentRubrique.questions || []
  const currentRubriqueAnswered = currentRubriqueQuestions.every(q => 
    reponses.has(q.idQuestionEvaluation)
  )

  // Calculer la progression par rubrique (nombre de rubriques complétées)
  const completedRubriquesCount = rubriquesAvecQuestions.filter(rubrique => {
    const rubriqueQuestions = rubrique.questions || []
    return rubriqueQuestions.length > 0 && 
      rubriqueQuestions.every(q => reponses.has(q.idQuestionEvaluation))
  }).length
  const totalRubriques = rubriquesAvecQuestions.length

  const goToPreviousRubrique = () => {
    if (!isFirstRubrique) {
      setCurrentRubriqueIndex(currentRubriqueIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToNextRubrique = () => {
    if (!isLastRubrique && currentRubriqueAnswered) {
      setCurrentRubriqueIndex(currentRubriqueIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
            {evaluation.designation}
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Enseignant :</span>{" "}
              <span className="text-gray-600">
                {evaluation.prenomEnseignant} {evaluation.nomEnseignant}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">UE :</span>{" "}
              <span className="text-gray-600">
                {evaluation.codeUe} ({evaluation.codeEc})
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">N° Évaluation :</span>{" "}
              <span className="text-gray-600">{evaluation.noEvaluation}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Date limite :</span>{" "}
              <span className="text-gray-600">{formatDate(evaluation.finReponse)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Progression globale */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Progression : {completedRubriquesCount} / {totalRubriques} rubriques complétées
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round((completedRubriquesCount / totalRubriques) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${(completedRubriquesCount / totalRubriques) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Progression par rubrique */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                Rubrique {currentRubriqueIndex + 1} sur {rubriquesAvecQuestions.length}
              </span>
              <div className="flex gap-1">
                {rubriquesAvecQuestions.map((rubrique, index) => {
                  const rubriqueQuestions = rubrique.questions || []
                  const rubriqueAnswered = rubriqueQuestions.length > 0 && 
                    rubriqueQuestions.every(q => reponses.has(q.idQuestionEvaluation))
                  
                  // Une rubrique est accessible si :
                  // - C'est la rubrique actuelle
                  // - C'est une rubrique précédente
                  // - C'est une rubrique suivante ET toutes les rubriques précédentes sont complétées
                  let isAccessible = index <= currentRubriqueIndex
                  if (index > currentRubriqueIndex) {
                    // Vérifier que toutes les rubriques avant celle-ci sont complétées
                    isAccessible = evaluation.rubriques.slice(0, index).every((r, i) => {
                      const questions = r.questions || []
                      return questions.length > 0 && questions.every(q => reponses.has(q.idQuestionEvaluation))
                    })
                  }
                  
                  const handleRubriqueClick = () => {
                    if (isAccessible && index !== currentRubriqueIndex) {
                      setCurrentRubriqueIndex(index)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }
                  
                  return (
                    <button
                      key={rubrique.idRubriqueEvaluation}
                      onClick={handleRubriqueClick}
                      disabled={!isAccessible}
                      className={`h-2 w-8 rounded-full transition-all ${
                        index === currentRubriqueIndex
                          ? 'bg-blue-500 ring-2 ring-blue-300'
                          : rubriqueAnswered
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      } ${
                        isAccessible && index !== currentRubriqueIndex
                          ? 'cursor-pointer hover:opacity-75'
                          : !isAccessible
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-default'
                      }`}
                      title={`${rubrique.designation || `Rubrique ${index + 1}`} ${
                        rubriqueAnswered ? '(Complétée)' : '(Non complétée)'
                      } ${!isAccessible ? '- Complétez les rubriques précédentes' : ''}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rubrique actuelle */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            {currentRubrique.designation || `Rubrique ${currentRubriqueIndex + 1}`}
          </h2>

          {!currentRubriqueQuestions || currentRubriqueQuestions.length === 0 ? (
            <p className="text-gray-500 italic">Aucune question dans cette rubrique</p>
          ) : (
            <div className="space-y-6">
              {currentRubriqueQuestions.map((question) => (
                <div key={question.idQuestionEvaluation} className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {question.intitule}
                  </p>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handlePositionnementChange(question.idQuestionEvaluation, value)}
                        className={`
                          flex-1 py-2 px-4 rounded-md border-2 text-sm font-medium transition-all
                          ${
                            reponses.get(question.idQuestionEvaluation) === value
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-gray-50"
                          }
                        `}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>{question.minimal || "Pas du tout"}</span>
                    <span>{question.maximal || "Tout à fait"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons de navigation */}
        {totalRubriques > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousRubrique}
              disabled={isFirstRubrique}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {!isLastRubrique ? (
              <Button
                onClick={goToNextRubrique}
                disabled={!currentRubriqueAnswered}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="text-sm text-gray-600">
                Dernière rubrique - Ajoutez un commentaire ci-dessous
              </div>
            )}
          </div>
        )}

        {!currentRubriqueAnswered && (
          <p className="mt-4 text-sm text-amber-600 text-center">
            Veuillez répondre à toutes les questions pour continuer
          </p>
        )}
      </div>

      {/* Commentaire */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="commentaire" className="block text-sm font-semibold text-gray-900">
            Commentaire (optionnel)
          </label>
          <span className={`text-xs ${
            commentaire.trim().length > 512 ? 'text-red-600 font-semibold' : 'text-gray-500'
          }`}>
            {commentaire.trim().length} / 512
          </span>
        </div>
        <textarea
          id="commentaire"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={4}
          maxLength={600}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            commentaire.trim().length > 512 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ajoutez vos commentaires ici..."
        />
        {commentaire.trim().length > 512 && (
          <p className="mt-1 text-xs text-red-600">
            Le commentaire ne peut pas dépasser 512 caractères (espaces de début et fin exclus)
          </p>
        )}
      </div>

      {/* Bouton de soumission */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || completedRubriquesCount < totalRubriques}
          size="lg"
          className="min-w-[200px]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Soumettre mes réponses
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
