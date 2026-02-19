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

  const generateAnnees = () => {
  const annees: string[] = []
    for (let year = 2013; year <= 2027; year++) {
      annees.push(`${year}-${year + 1}`)
    }
    return annees
  }

  const anneesUniversitaires = generateAnnees()

  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">
        Informations générales
      </h2>

      {/* <div className="grid gap-4 md:grid-cols-2">
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
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Formation */}
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
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Année universitaire */}
        <div className="space-y-1.5">
          <Label>Année universitaire</Label>
          <Select
            value={values.anneeUniversitaire || undefined}
            onValueChange={(value) =>
              onChange({
                ...values,
                anneeUniversitaire: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              {anneesUniversitaires.map((annee) => (
                <SelectItem key={annee} value={annee}>
                  {annee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* État */}
        <div className="space-y-1.5">
          <Label>État</Label>
          <Select
            disabled={disabled}
            value={values.etat}
            onValueChange={(value) =>
              onChange({
                ...values,
                etat: value as "ELA" | "DIS" | "CLO",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un état" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ELA">En cours d'élaboration</SelectItem>
              <SelectItem value="DIS">Mise à disposition</SelectItem>
              <SelectItem value="CLO">Clôturée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Période */}
        <div className="space-y-1.5">
          <Label>Période</Label>
          <Input
            disabled={disabled}
            placeholder="Ex: S1 2024"
            value={values.periode}
            onChange={(e) =>
              onChange({
                ...values,
                periode: e.target.value,
              })
            }
          />
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-4">
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
        <div className="space-y-1.5">
          <Label>Numéro d’évaluation</Label>
          <Input
            type="number"
            min={1}
            placeholder="Ex : 1"
            value={values.noEvaluation}
            onChange={(e) =>
              onChange({
                ...values,
                noEvaluation: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>

      </div>
    </div>
  )
}

