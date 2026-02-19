import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  EvaluationDetailDTO,
  EvaluationStatus,
  EvaluationWithRubriquesDTO,
  getEcs,
  getFormations,
  getUes,
  createEvaluation,
  updateEvaluation,
  getEvaluationFull,
} from "../../services/EvaluationService"
import {
  EvaluationHeaderForm,
  EvaluationHeaderFormValues
} from "../../components/evaluations/EvaluationHeaderForm"
import { RubriquesSection } from "../../components/evaluations/RubriquesSection"
import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"


export function EvaluationForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formations, setFormations] = useState<string[]>([])
  const [ues, setUes] = useState<String[]>([])
  const [ecs, setEcs] = useState<String[]>([])

  const [headerValues, setHeaderValues] = useState<EvaluationHeaderFormValues>({
    codeFormation: "",
    anneeUniversitaire: "",
    codeUe: "",
    codeEc: "",
    designation: "",
    debutReponse: "",
    finReponse: "",
    etat: "ELA",
    periode: "",
    noEvaluation: "",
  })

  const [etat, setEtat] = useState<EvaluationStatus>("ELA")
  const [rubriques, setRubriques] = useState<EvaluationWithRubriquesDTO["rubriques"]>([])

  const reloadEvaluation = async (evaluationId: number) => {
    const data = await getEvaluationFull(evaluationId)
    setRubriques(data.rubriques || [])
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        const formationsData = await getFormations()
        setFormations(formationsData)

        if (isEdit && id) {
          const evaluation = await getEvaluationFull(Number(id))
          console.log("asss", evaluation)
          setEtat(evaluation.etat as EvaluationStatus)
          setRubriques(evaluation.rubriques || [])

          setHeaderValues({
            codeFormation: evaluation.codeFormation,
            anneeUniversitaire: evaluation.anneeUniversitaire,
            codeUe: evaluation.codeUe,
            codeEc: evaluation.codeEc,
            designation: evaluation.designation,
            debutReponse: evaluation.debutReponse.slice(0, 10),
            finReponse: evaluation.finReponse.slice(0, 10),
            etat: evaluation.etat,
            periode: evaluation.periode,
            noEvaluation: evaluation.noEvaluation,
          })

          const [uesData, ecsData] = await Promise.all([
            getUes(evaluation.codeFormation),
            getEcs(evaluation.codeFormation, evaluation.codeUe),
          ])
          setUes(uesData)
          setEcs(ecsData)
        }
      } catch (e: any) {
        setError(
          e.message || "Erreur lors du chargement du formulaire d'évaluation.",
        )
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [id, isEdit])

  const handleFormationChange = async (codeFormation: string) => {
    setHeaderValues((prev) => ({
      ...prev,
      codeFormation,
      codeUe: "",
      codeEc: "",
    }))
    setUes([])
    setEcs([])

    if (!codeFormation) return
    try {
      const uesData = await getUes(codeFormation)
      setUes(uesData)
    } catch {
      // ignore
    }
  }

  const handleUeChange = async (codeUe: string) => {
    setHeaderValues((prev) => ({
      ...prev,
      codeUe,
      codeEc: "",
    }))
    setEcs([])

    if (!headerValues.codeFormation || !codeUe) return
    try {
      const ecsData = await getEcs(headerValues.codeFormation, codeUe)
      setEcs(ecsData)
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: EvaluationDetailDTO = {
      id: isEdit && id ? Number(id) : undefined,
      anneeUniversitaire: headerValues.anneeUniversitaire,
      codeFormation: headerValues.codeFormation,
      codeUe: headerValues.codeUe,
      codeEc: headerValues.codeEc,
      designation: headerValues.designation,
      etat: headerValues.etat,
      periode: headerValues.periode,
      debutReponse: headerValues.debutReponse,
      finReponse: headerValues.finReponse,
      noEvaluation: Number(headerValues.noEvaluation),
      // Les rubriques sont gérées via les endpoints dédiés (/rubriques, /questions)
      // pour ne pas casser l’assignation existante côté backend.
      rubriques: [],
    }

    try {
      if (isEdit && id) {
        console.log("PAYLOAD SENT:", payload)
        await updateEvaluation(Number(id), payload)
      } else {
        await createEvaluation(payload)
      }
      navigate("/evaluations")
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement de l'évaluation.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6 px-4 py-4 sm:p-6 pb-8 sm:pb-10 min-w-0"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {isEdit ? "Modifier une évaluation" : "Nouvelle évaluation"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Renseignez les informations générales puis ajoutez les rubriques et
            questions.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/evaluations")}
          className="w-full sm:w-auto shrink-0"
        >
          Retour à la liste
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <EvaluationHeaderForm
        values={headerValues}
        formations={formations}
        ues={ues}
        ecs={ecs}
        onChange={setHeaderValues}
        onFormationChange={handleFormationChange}
        onUeChange={handleUeChange}
      />

      <RubriquesSection
        rubriques={rubriques}
        onChange={setRubriques}
        evaluationId={id ? Number(id) : undefined}
        onReload={() => id && reloadEvaluation(Number(id))}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-4 sm:pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/evaluations")}
          className="w-full sm:w-auto"
        >
          Annuler
        </Button>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  )
}

