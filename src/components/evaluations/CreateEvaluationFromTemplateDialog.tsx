import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/DatePickerField"
import { Loader2, GraduationCap, FileText, Calendar } from "lucide-react"
import {
  getFormations,
  getUes,
  getEcs,
  getAnneesUniversitaires,
  createEvaluationFromQuestionnaire,
  type CreateEvaluationFromQuestionnairePayload,
  type EvaluationResponseDTO,
} from "@/services/EvaluationService"
import { getCurrentUser } from "@/services/authService"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface CreateEvaluationFromTemplateFormValues {
  codeFormation: string
  anneeUniversitaire: string
  codeUe: string
  codeEc: string
  designation: string
  periode: string
  debutReponse: string
  finReponse: string
}

const initialFormValues: CreateEvaluationFromTemplateFormValues = {
  codeFormation: "",
  anneeUniversitaire: "",
  codeUe: "",
  codeEc: "",
  designation: "",
  periode: "",
  debutReponse: "",
  finReponse: "",
}

interface CreateEvaluationFromTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idQuestionnaire: number
  questionnaireDesignation: string
  onSuccess?: (evaluation: EvaluationResponseDTO) => void
}

const today = new Date().toISOString().split("T")[0]

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-50/80 px-2.5 py-1.5 w-fit mb-3">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
        {children}
      </span>
    </div>
  )
}

export function CreateEvaluationFromTemplateDialog({
  open,
  onOpenChange,
  idQuestionnaire,
  questionnaireDesignation,
  onSuccess,
}: CreateEvaluationFromTemplateDialogProps) {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<CreateEvaluationFromTemplateFormValues>(initialFormValues)
  const [formations, setFormations] = useState<string[]>([])
  const [annees, setAnnees] = useState<string[]>([])
  const [ues, setUes] = useState<string[]>([])
  const [ecs, setEcs] = useState<string[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdEvaluation, setCreatedEvaluation] = useState<EvaluationResponseDTO | null>(null)

  const isSuccessState = !!createdEvaluation

  useEffect(() => {
    if (!open) return
    setFormValues(initialFormValues)
    setCreatedEvaluation(null)
    setAnnees([])
    setUes([])
    setEcs([])
    const load = async () => {
      setLoadingOptions(true)
      try {
        const data = await getFormations()
        setFormations(data)
      } catch {
        toast.error("Impossible de charger les formations.")
      } finally {
        setLoadingOptions(false)
      }
    }
    void load()
  }, [open])

  useEffect(() => {
    if (formValues.finReponse && formValues.debutReponse) {
      if (formValues.finReponse < formValues.debutReponse) {
        setFormValues((prev) => ({
          ...prev,
          finReponse: "",
        }))
      }
    }
  }, [formValues.debutReponse])

  const handleFormationChange = async (codeFormation: string) => {
    setFormValues((prev) => ({
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
    setFormValues((prev) => ({ ...prev, codeUe, codeEc: "" }))
    setEcs([])
    if (!formValues.codeFormation || !codeUe) return
    try {
      const ecsData = await getEcs(formValues.codeFormation, codeUe)
      setEcs(ecsData)
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = await getCurrentUser()
    if (!user?.id) {
      toast.error("Utilisateur non connecté.")
      return
    }
    const noEnseignant = user.id
    setSubmitting(true)
    try {
      const payload: CreateEvaluationFromQuestionnairePayload = {
        idQuestionnaire,
        codeFormation: formValues.codeFormation,
        anneeUniversitaire: formValues.anneeUniversitaire,
        codeUe: formValues.codeUe,
        codeEc: formValues.codeEc || undefined,
        designation: formValues.designation,
        periode: formValues.periode || undefined,
        debutReponse: formValues.debutReponse,
        finReponse: formValues.finReponse,
      }
      const result = await createEvaluationFromQuestionnaire(payload, noEnseignant)
      setCreatedEvaluation(result)
      toast.success("Évaluation créée avec succès.")
      onSuccess?.(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de l'évaluation."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCreatedEvaluation(null)
  }

  const handleGoToEvaluation = () => {
    if (createdEvaluation) {
      navigate(`/evaluations/${createdEvaluation.idEvaluation}`)
      handleClose()
    }
  }

  const handleModifyEvaluation = () => {
    if (createdEvaluation) {
      navigate(`/evaluations/${createdEvaluation.idEvaluation}/edit`)
      handleClose()
    }
  }

  const handleGoToList = () => {
    navigate("/evaluations")
    handleClose()
  }

  const isFormValid = !!(
  formValues.codeFormation &&
  formValues.anneeUniversitaire &&
  formValues.codeUe &&
  formValues.designation &&
  formValues.periode &&
  formValues.debutReponse &&
  formValues.finReponse
)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6"
        onPointerDownOutside={(e) => !isSuccessState && undefined}
        onEscapeKeyDown={() => !isSuccessState && handleClose()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isSuccessState
              ? "Évaluation créée"
              : `Créer une évaluation à partir de « ${questionnaireDesignation} »`}
          </DialogTitle>
        </DialogHeader>

        {isSuccessState ? (
          <div className="space-y-5 py-4 text-center">

            <p className="text-sm text-gray-600">
              L'évaluation a été créée avec les rubriques et questions du questionnaire template.
            </p>

            <div className="flex flex-wrap justify-center gap-3">

              {/* VOIR (primary) */}
              <Button
                type="button"
                onClick={handleGoToEvaluation}
                className="bg-black text-white hover:bg-black/90"
              >
                Voir l'évaluation
              </Button>

              {/* MODIFIER (secondary important) */}
              <Button
                type="button"
                onClick={handleModifyEvaluation}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Modifier l'évaluation
              </Button>

              {/* RETOUR (secondary light) */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoToList}
                className="border-gray-300"
              >
                Retour à la liste des évaluations
              </Button>

            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <SectionLabel icon={GraduationCap}>Contexte académique</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">
                    Code formation <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    disabled={loadingOptions}
                    value={formValues.codeFormation}
                    onValueChange={handleFormationChange}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Sélectionner une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {formations.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">
                    Année universitaire <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    key={formValues.codeFormation} 
                    required
                    disabled={!formValues.codeFormation}
                    value={formValues.anneeUniversitaire || undefined}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({ ...prev, anneeUniversitaire: value }))
                    }
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {annees.map((annee) => (
                        <SelectItem key={annee} value={annee}>
                          {annee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel icon={FileText}>Unité d'enseignement</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">
                    Unité d’enseignement <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    key={formValues.codeFormation}
                    required
                    disabled={!formValues.codeFormation}
                    value={formValues.codeUe || undefined}
                    onValueChange={handleUeChange}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Sélectionner une UE" />
                    </SelectTrigger>
                    <SelectContent>
                      {ues.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">Élément constitutif</Label>
                  <Select
                    key={formValues.codeUe}
                    disabled={!formValues.codeUe}
                    value={formValues.codeEc || undefined}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({ ...prev, codeEc: value }))
                    }
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Sélectionner une EC" />
                    </SelectTrigger>
                    <SelectContent>
                      {ecs.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-sm font-medium">
                Désignation <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ex: Évaluation intermédiaire S1"
                value={formValues.designation}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, designation: e.target.value }))
                }
                className="h-10 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-sm font-medium">Période <span className="text-red-500">*</span></Label>
              <Input
                required
                placeholder="Ex: S1 2024"
                value={formValues.periode}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, periode: e.target.value }))
                }
                className="h-10 bg-white"
              />
            </div>

            <div>
              <SectionLabel icon={Calendar}>Période de réponses</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">
                    Date début réponses <span className="text-red-500">*</span>
                  </Label>
                  <DatePickerField
                    value={formValues.debutReponse}
                    min={today}
                    onChange={(value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        debutReponse: value,
                        finReponse: "", // 🔥 reset auto
                      }))
                    }
                    placeholder="Sélectionner une date"
                  />
                  <input
                    type="text"
                    required
                    value={formValues.debutReponse}
                    onChange={() => { }}
                    className="hidden"
                  />

                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">
                    Date fin réponses <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DatePickerField
                            disabled={!formValues.debutReponse} // 🔒 bloque si pas début
                            value={formValues.finReponse}
                            min={formValues.debutReponse || today} // 🔥 min dynamique
                            onChange={(value) =>
                              setFormValues((prev) => ({ ...prev, finReponse: value }))
                            }
                            placeholder="Sélectionner une date"
                          />
                        </div>
                      </TooltipTrigger>

                      {!formValues.debutReponse && (
                        <TooltipContent>
                          Sélectionnez d’abord une date de début.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <input
                    type="text"
                    required
                    value={formValues.finReponse}
                    onChange={() => { }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <TooltipProvider>
                <Tooltip>

                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="submit"
                        disabled={submitting || !isFormValid}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Création...
                          </>
                        ) : (
                          "Créer l'évaluation"
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>

                  {!isFormValid && (
                    <TooltipContent>
                      Remplissez d’abord tous les champs obligatoires
                    </TooltipContent>
                  )}

                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
