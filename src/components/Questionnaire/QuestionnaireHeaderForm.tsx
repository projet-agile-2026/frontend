import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"

export interface QuestionnaireHeaderValues {
  designation: string
}

interface Props {
  values: QuestionnaireHeaderValues
  disabled?: boolean
  questionnaireId?: number
  isEdit?: boolean
  onChange: (values: QuestionnaireHeaderValues) => void
  onSave?: () => void
}

export function QuestionnaireHeaderForm({
  values,
  disabled,
  questionnaireId,
  onChange,
  onSave,
  isEdit,
}: Props) {

  const [isEditing, setIsEditing] = useState(!questionnaireId)

  if (!isEditing && questionnaireId) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">

        <div>
          <CardTitle>
            Informations du questionnaire
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Désignation du questionnaire
          </p>
        </div>

        {!disabled && (
          <Button onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        )}

      </CardHeader>

      <CardContent>
        <p className="text-gray-900 font-medium">
          {values.designation || "—"}
        </p>
      </CardContent>
    </Card>
  )
}
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">

        <div>
          <CardTitle>
            Informations du questionnaire
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Donnez une désignation au questionnaire avant d’ajouter les rubriques
          </p>
        </div>

        {!disabled && (
          <Button
            type="button"
            onClick={async () => {
              await onSave?.()
              setIsEditing(false)
            }}
          >
            Enregistrer
          </Button>
        )}

      </CardHeader>

      <CardContent className="space-y-4">

        <div className="space-y-2">

          <Label>
            Désignation <span className="text-red-500">*</span>
          </Label>

          <Input
            placeholder="Ex : Questionnaire satisfaction UE"
            value={values.designation}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...values,
                designation: e.target.value
              })
            }
          />

        </div>

      </CardContent>
    </Card>
  )
}
