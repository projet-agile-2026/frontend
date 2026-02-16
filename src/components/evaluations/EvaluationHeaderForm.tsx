import { useEffect } from "react"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Label } from "../ui/label"

export interface EvaluationHeaderFormValues {
  codeFormation: string
  anneeUniversitaire: string
  codeUe: string
  codeEc: string
  designation: string
  debutReponse: string
  finReponse: string
}

interface EvaluationHeaderFormProps {
  values: EvaluationHeaderFormValues
  formations: String[]
  ues: String[]
  ecs: String[]
  disabled?: boolean
  onChange: (values: EvaluationHeaderFormValues) => void
  onFormationChange: (codeFormation: string) => void
  onUeChange: (codeUe: string) => void
}

export function EvaluationHeaderForm({
  values,
  formations,
  ues,
  ecs,
  disabled,
  onChange,
  onFormationChange,
  onUeChange,
}: EvaluationHeaderFormProps) {
  // Ensure cascade reset behaviour when parent resets values
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.codeFormation, values.codeUe])

  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">
        Informations générales
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Formation</Label>
          <Select
            disabled={disabled}
            value={values.codeFormation || undefined}
            onValueChange={(value) => {
              onFormationChange(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une formation" />
            </SelectTrigger>
            <SelectContent>
              {formations.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                >
                  {code}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Année universitaire</Label>
          <Input
            disabled={disabled}
            placeholder="2024-2025"
            value={values.anneeUniversitaire}
            onChange={(e) =>
              onChange({ ...values, anneeUniversitaire: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>UE</Label>
          <Select
            disabled={disabled || !values.codeFormation}
            value={values.codeUe || undefined}
            onValueChange={(value) => {
              onUeChange(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une UE" />
            </SelectTrigger>
            <SelectContent>
              {ues.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                >
                  {code}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>EC</Label>
          <Select
            disabled={disabled || !values.codeUe}
            value={values.codeEc || undefined}
            onValueChange={(value) =>
              onChange({
                ...values,
                codeEc: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une EC" />
            </SelectTrigger>
            <SelectContent>
              {ecs.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                >
                  {code}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Désignation</Label>
          <Input
            disabled={disabled}
            placeholder="Ex : Évaluation intermédiaire S1"
            value={values.designation}
            onChange={(e) =>
              onChange({
                ...values,
                designation: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Date début réponses</Label>
          <Input
            disabled={disabled}
            type="date"
            value={values.debutReponse}
            onChange={(e) =>
              onChange({
                ...values,
                debutReponse: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date fin réponses</Label>
          <Input
            disabled={disabled}
            type="date"
            value={values.finReponse}
            onChange={(e) =>
              onChange({
                ...values,
                finReponse: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}

