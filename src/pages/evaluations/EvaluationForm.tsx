import { useEffect, useState, type FC } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import {
  type EvaluationDetailDTO,
  type EvaluationStatus,
  type EvaluationWithRubriquesDTO,
  getEcs,
  getFormations,
  getUes,
  createEvaluation,
  updateEvaluation,
  getEvaluationFull,
  getAnneesUniversitaires
} from "../../services/EvaluationService"
import {
  EvaluationHeaderForm,
  type EvaluationHeaderFormValues
} from "../../components/evaluations/EvaluationHeaderForm"
import { RubriquesSection } from "../../components/evaluations/RubriquesSection"
import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

export type EvaluationFormProps = {
  readOnly?: boolean
}

export const EvaluationForm: FC<EvaluationFormProps> = ({ readOnly = false }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const location = useLocation()
  const prefill = (location.state as any)?.prefill ?? null

  const isEdit = !!id
  const isViewMode = readOnly === true

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formations, setFormations] = useState<string[]>([])
  const [ues, setUes] = useState<String[]>([])
  const [ecs, setEcs] = useState<String[]>([])

  const [evaluationId, setEvaluationId] = useState<number | undefined>(
    id ? Number(id) : undefined
  )

  // ranya - bloquer le bouton Enregistrer pendant une édition inline
  const [isEditingRubrique, setIsEditingRubrique] = useState(false)

  const handleSaveHeader = async () => {
    try {
      setSaving(true)

      const payload: EvaluationDetailDTO = {
        anneeUniversitaire: headerValues.anneeUniversitaire,
        codeFormation: headerValues.codeFormation,
        codeUe: headerValues.codeUe,
        codeEc: headerValues.codeEc,
        designation: headerValues.designation,
        etat: headerValues.etat,
        periode: headerValues.periode,
        debutReponse: headerValues.debutReponse,
        finReponse: headerValues.finReponse,
        rubriques: []
      }

      if (evaluationId) {
        await updateEvaluation(evaluationId, payload)
        setSuccessMessage(
          `L'évaluation "${headerValues.designation}" a bien été mise à jour.`
        )
      } else {
        const created = await createEvaluation(payload)
        setEvaluationId(created.idEvaluation)
        setSuccessMessage(
          `L'évaluation "${headerValues.designation}" a bien été enregistrée. Vous pouvez maintenant ajouter les rubriques.`
        )
      }

      setSuccessDialogOpen(true)

    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

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

  const isHeaderValid =
    headerValues.codeFormation &&
    headerValues.anneeUniversitaire &&
    headerValues.codeUe &&
    headerValues.designation &&
    headerValues.debutReponse &&
    headerValues.finReponse

  const [etat, setEtat] = useState<EvaluationStatus>("ELA")
  const [rubriques, setRubriques] = useState<EvaluationWithRubriquesDTO["rubriques"]>([])

  const [annees, setAnnees] = useState<string[]>([])
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

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

          const [anneesData, uesData, ecsData] = await Promise.all([
            getAnneesUniversitaires(evaluation.codeFormation),
            getUes(evaluation.codeFormation),
            getEcs(evaluation.codeFormation, evaluation.codeUe),
          ])
          setAnnees(anneesData)
          setUes(uesData)
          setEcs(ecsData)

        } else if (prefill) {
          setEtat("ELA")
          setHeaderValues({
            codeFormation: prefill.codeFormation ?? "",
            anneeUniversitaire: prefill.anneeUniversitaire ?? "",
            codeUe: prefill.codeUe ?? "",
            codeEc: prefill.codeEc ?? "",
            designation: prefill.designation ?? "",
            debutReponse: prefill.debutReponse?.slice(0, 10) ?? "",
            finReponse: prefill.finReponse?.slice(0, 10) ?? "",
            etat: "ELA",
            periode: prefill.periode ?? "",
            noEvaluation: "",
          })

          const [anneesData, uesData, ecsData] = await Promise.all([
            getAnneesUniversitaires(prefill.codeFormation),
            getUes(prefill.codeFormation),
            getEcs(prefill.codeFormation, prefill.codeUe),
          ])
          setAnnees(anneesData)
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
      anneeUniversitaire: "",
      codeUe: "",
      codeEc: "",
    }))

    setAnnees([])
    setUes([])
    setEcs([])

    if (!codeFormation) return

    try {
      const [anneesData, uesData] = await Promise.all([
        getAnneesUniversitaires(codeFormation),
        getUes(codeFormation),
      ])

      setAnnees(anneesData)
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

    if (isViewMode) return
    setSaving(true)
    setError(null)

    const payload: EvaluationDetailDTO = {
      anneeUniversitaire: headerValues.anneeUniversitaire,
      codeFormation: headerValues.codeFormation,
      codeUe: headerValues.codeUe,
      codeEc: headerValues.codeEc,
      designation: headerValues.designation,
      etat: headerValues.etat,
      periode: headerValues.periode,
      debutReponse: headerValues.debutReponse,
      finReponse: headerValues.finReponse,
      rubriques: [],
    }

    try {
      if (evaluationId) {
        await updateEvaluation(evaluationId, payload)
      } else {
        const created = await createEvaluation(payload)
        setEvaluationId(created.idEvaluation)
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
            {isEdit
              ? `Modifier l'évaluation : ${headerValues.designation}`
              : "Nouvelle évaluation"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {!isEdit && "Renseignez les informations générales puis ajoutez les rubriques et questions"}
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

      <EvaluationHeaderForm
        values={headerValues}
        formations={formations}
        ues={ues}
        ecs={ecs}
        annees={annees}
        disabled={isViewMode}
        isEdit={isEdit}
        onChange={setHeaderValues}
        onFormationChange={handleFormationChange}
        onUeChange={handleUeChange}
        onSaveHeader={handleSaveHeader}
        isHeaderSaved={!!evaluationId}
        isFormValid={isHeaderValid}
      />

      <RubriquesSection
        rubriques={rubriques}
        onChange={setRubriques}
        evaluationId={evaluationId}
        onReload={
          isViewMode
            ? undefined
            : () => evaluationId && reloadEvaluation(evaluationId)
        }
        readOnly={isViewMode}
        onEditingChange={setIsEditingRubrique}
      />

      {!isViewMode && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-4 sm:pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/evaluations")}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <TooltipProvider>
            <Tooltip>

              <TooltipTrigger asChild>
                <span className="w-full sm:w-auto">
                  <Button
                    type="submit"
                    disabled={saving || isEditingRubrique || !isHeaderValid}
                    className="w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer"
                    )}
                  </Button>
                </span>
              </TooltipTrigger>

              {!isHeaderValid && (
                <TooltipContent>
                  Complétez les informations de l’évaluation
                </TooltipContent>
              )}

            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrement réussi</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-gray-600">
            {successMessage}
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setSuccessDialogOpen(false)}>
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}