import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  EvaluationDetailDTO,
  EvaluationRubriquePayload,
  EvaluationStatus,
  FormationDTO,
  getEcs,
  getEvaluation,
  getFormations,
  getUes,
  createEvaluation,
  updateEvaluation,
} from "../../services/EvaluationService"
import {
  EvaluationHeaderForm,
  EvaluationHeaderFormValues,
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

  const [formations, setFormations] = useState<FormationDTO[]>([])
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
  })

  const [etat, setEtat] = useState<EvaluationStatus>("BROUILLON")
  const [rubriques, setRubriques] = useState<EvaluationRubriquePayload[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        const formationsData = await getFormations()
        setFormations(formationsData)

        if (isEdit && id) {
          const evaluation = await getEvaluation(Number(id))
          setEtat(evaluation.etat)
          setRubriques(evaluation.rubriques || [])

          setHeaderValues({
            codeFormation: evaluation.codeFormation,
            anneeUniversitaire: evaluation.anneeUniversitaire,
            codeUe: evaluation.codeUe,
            codeEc: evaluation.codeEc,
            designation: evaluation.designation,
            debutReponse: evaluation.debutReponse.slice(0, 10),
            finReponse: evaluation.finReponse.slice(0, 10),
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
      debutReponse: headerValues.debutReponse,
      finReponse: headerValues.finReponse,
      etat,
      rubriques: rubriques || [],
    }

    try {
      if (isEdit && id) {
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
      className="mx-auto max-w-5xl space-y-6 p-6 pb-10"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Modifier une évaluation" : "Nouvelle évaluation"}
          </h1>
          <p className="text-sm text-gray-500">
            Renseignez les informations générales puis ajoutez les rubriques et
            questions.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/evaluations")}
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

      <RubriquesSection rubriques={rubriques} onChange={setRubriques} />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/evaluations")}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
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

