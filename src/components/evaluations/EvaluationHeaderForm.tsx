import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Calendar, GraduationCap, FileText } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { DatePickerField } from "../DatePickerField"
import { Button } from "../ui/button"


export interface EvaluationHeaderFormValues {
  codeFormation: string
  anneeUniversitaire: string
  codeUe: string
  codeEc: string
  designation: string
  etat: "ELA" | "DIS" | "CLO"
  periode: string
  debutReponse: string
  finReponse: string
  noEvaluation: number | ""
}

interface EvaluationHeaderFormProps {
  values: EvaluationHeaderFormValues
  formations: String[]
  ues: String[]
  ecs: String[]
  disabled?: boolean
  annees: string[]
  isEdit?: boolean
  onChange: (values: EvaluationHeaderFormValues) => void
  onFormationChange: (codeFormation: string) => void
  onUeChange: (codeUe: string) => void
  onSaveHeader?: () => void
  isHeaderSaved?: boolean
  isFormValid?: boolean
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-50/80 px-2.5 py-1.5 w-fit mb-4">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
        {children}
      </span>
    </div>
  )
}

export function EvaluationHeaderForm({
  values,
  formations,
  ues,
  ecs,
  annees,
  disabled,
  isEdit,
  onChange,
  onFormationChange,
  onUeChange,
  onSaveHeader,
  isHeaderSaved,
  isFormValid
}: EvaluationHeaderFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isEditing, setIsEditing] = useState(!isHeaderSaved)
  useEffect(() => {

    if (!values.codeFormation && (values.codeUe || values.codeEc)) {
      onChange({
        ...values,
        codeUe: "",
        codeEc: "",
      })
    } else if (!values.codeUe && values.codeEc) {
      onChange({
        ...values,
        codeEc: "",
      })
    }
    console.log("EValuationHeader", values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.codeFormation, values.codeUe])
  function RequiredLabel({ children }: { children: React.ReactNode }) {
    return (
      <Label className="text-gray-600 text-sm font-medium">
        {children} <span className="text-red-500">*</span>
      </Label>
    )
  }

  if (!isEditing && isHeaderSaved) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="flex justify-between items-center">

          <div>
            <CardTitle>Informations de l'évaluation</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {values.designation}
            </p>
          </div>

          {!disabled && (
            <Button onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}

        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm py-0 gap-0">
      <CardHeader className="border-b border-gray-200/80 bg-gradient-to-b from-gray-50/80 to-white px-5 sm:px-6 pt-5 sm:pt-6 pb-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-gray-900">
              Informations de l&apos;évaluation
            </CardTitle>

            <p className="text-sm text-gray-500 font-normal mt-1">
              Contexte académique, unité d&apos;enseignement et période de réponses
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>

              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    onClick={async () => {
                      await onSaveHeader?.()
                      setIsEditing(false)
                    }}
                    disabled={disabled || !isFormValid}
                  >
                    Enregistrer
                  </Button>
                </span>
              </TooltipTrigger>

              {!isFormValid && (
                <TooltipContent>
                  Remplissez tous les champs obligatoires
                </TooltipContent>
              )}

            </Tooltip>

          </TooltipProvider>

        </div>

      </CardHeader>

      <CardContent className="p-0">
        {/* 1. Contexte académique */}
        <div className="px-5 sm:px-6 py-5">

          <SectionLabel icon={GraduationCap}>
            Contexte académique
          </SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <RequiredLabel>Code Formation</RequiredLabel>
              <Select
                required
                disabled={disabled}
                value={values.codeFormation || undefined}
                onValueChange={onFormationChange}
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
              <RequiredLabel>Année universitaire</RequiredLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select
                        required
                        disabled={disabled || !values.codeFormation}
                        value={values.anneeUniversitaire || undefined}
                        onValueChange={(value) =>
                          onChange({ ...values, anneeUniversitaire: value })
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
                  </TooltipTrigger>

                  {!values.codeFormation && (
                    <TooltipContent>
                      Sélectionnez d’abord une formation.
                    </TooltipContent>
                  )}

                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <RequiredLabel>Période</RequiredLabel>
              <Input
                disabled={disabled}
                placeholder="Ex: S1 2024"
                value={values.periode}
                onChange={(e) =>
                  onChange({ ...values, periode: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-sm font-medium">
                État
              </Label>

              <div className="text-base font-semibold text-gray-900 h-10 flex items-center">
                {{
                  ELA: "En cours d'élaboration",
                  DIS: "Mise à disposition",
                  CLO: "Clôturée",
                }[values.etat]}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 sm:mx-6 border-t border-gray-100" aria-hidden />

        {/* 2. Unité d'enseignement */}
        <div className="px-5 sm:px-6 py-5">
          <SectionLabel icon={FileText}>
            Unité d&apos;enseignement
          </SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <RequiredLabel>Unité d’enseignement</RequiredLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select
                        required
                        disabled={disabled || !values.codeFormation}
                        value={values.codeUe || undefined}
                        onValueChange={onUeChange}
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
                  </TooltipTrigger>

                  {!values.codeFormation && (
                    <TooltipContent>
                      Sélectionnez d’abord une formation.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-sm font-medium">Élément constitutif</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select
                        disabled={disabled || !values.codeUe}
                        value={values.codeEc || undefined}
                        onValueChange={(value) =>
                          onChange({ ...values, codeEc: value })
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
                  </TooltipTrigger>

                  {!values.codeUe && (
                    <TooltipContent>
                      Sélectionnez d’abord une UE.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <RequiredLabel>Désignation</RequiredLabel>
              <Input
                required
                disabled={disabled}
                placeholder="Ex: Évaluation intermédiaire S1"
                value={values.designation}
                onChange={(e) =>
                  onChange({ ...values, designation: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mx-5 sm:mx-6 border-t border-gray-100" aria-hidden />

        {/* 3. Période de réponses */}
        <div className="px-5 sm:px-6 pt-5 pb-6">
          <SectionLabel icon={Calendar}>
            Période de réponses
          </SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <RequiredLabel>Date début réponses</RequiredLabel>
              <DatePickerField
                disabled={disabled}
                value={values.debutReponse}
                onChange={(value) =>
                  onChange({ ...values, debutReponse: value })
                }
                placeholder="Sélectionner une date"
              />
            </div>

            <div className="space-y-2">
              <RequiredLabel>Date fin réponses</RequiredLabel>
              <DatePickerField
                disabled={disabled}
                value={values.finReponse}
                min={values.debutReponse}
                onChange={(value) =>
                  onChange({ ...values, finReponse: value })
                }
                placeholder="Sélectionner une date"
              />
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm font-medium">
                  Numéro d’évaluation
                </Label>

                <div className="text-base font-semibold text-gray-900 h-10 flex items-center">
                  {values.noEvaluation}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
