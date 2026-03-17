import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check } from "lucide-react"
import {
  createQuestionnaire,
  updateQuestionnaire,
  getQuestionnaireFull
} from "../../services/QuestionnaireService"

import { QuestionnaireHeaderForm, type QuestionnaireHeaderValues } from "@/components/Questionnaire/QuestionnaireHeaderForm"

import { RubriquesQuestionnaireSection } from "@/components/Questionnaire/RubriquesQuestionnaireSection"

import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"

export type QuestionnaireFormProps = {
  readOnly?: boolean
}

export function QuestionnaireForm({ readOnly = false }: QuestionnaireFormProps) {

  const navigate = useNavigate()
  const { id } = useParams()

  const isViewMode = readOnly === true

  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [questionnaireId, setQuestionnaireId] = useState<number | undefined>(
    id ? Number(id) : undefined
  )

  const [headerValues, setHeaderValues] = useState<QuestionnaireHeaderValues>({
    designation: ""
  })

  const [rubriques, setRubriques] = useState<any[]>([])

  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {

    const init = async () => {

      try {

        if (isEdit && id) {

          const data = await getQuestionnaireFull(Number(id))

          setHeaderValues({
            designation: data.designation
          })

          setRubriques(data.rubriques || [])

        }

      } finally {
        setLoading(false)
      }

    }

    void init()

  }, [id])

  const handleSaveHeader = async () => {
    try {
      setSaving(true)

      const designation = headerValues.designation

      if (questionnaireId) {
        await updateQuestionnaire(questionnaireId, designation)
      } else {
        const created = await createQuestionnaire(designation)

        setQuestionnaireId(created.idQuestionnaire)

        setSuccessOpen(true)
      }

    } finally {
      setSaving(false)
    }
  }

  const reloadQuestionnaire = async (id: number) => {

    const data = await getQuestionnaireFull(id)

    setRubriques(data.rubriques || [])

  }

  if (loading) {

    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )

  }

  return (

    <div className="mx-auto max-w-4xl space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">

          {isViewMode
            ? `Questionnaire : ${headerValues.designation}`
            : isEdit
              ? `Modifier questionnaire : ${headerValues.designation}`
              : "Nouveau questionnaire"}

        </h1>

        <Button
          variant="outline"
          onClick={() => navigate("/questionnaires")}
        >
          Retour
        </Button>

      </div>


      <QuestionnaireHeaderForm
        values={headerValues}
        onChange={setHeaderValues}
        onSave={handleSaveHeader}
        disabled={isViewMode}
        isEdit={isEdit}
      />


      <RubriquesQuestionnaireSection
        rubriques={rubriques}
        onChange={setRubriques}
        questionnaireId={questionnaireId}
        onReload={() =>
          questionnaireId && reloadQuestionnaire(questionnaireId)
        }
        readOnly={isViewMode}
      />

      <div className="flex justify-end gap-3 pt-6">

        <Button
          variant="outline"
          onClick={() => navigate("/questionnaires")}
        >
          Annuler
        </Button>

        <Button
          onClick={() => navigate("/questionnaires")}
        >
          Terminer
        </Button>

      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md text-center">

          <DialogHeader>

            <div className="flex justify-center mb-2">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
                <Check className="h-7 w-7 text-green-600" />
              </div>
            </div>

            <DialogTitle className="text-lg font-semibold">
              Questionnaire enregistré
            </DialogTitle>

          </DialogHeader>

          <p className="text-sm text-gray-600">
            Vous pouvez maintenant ajouter des rubriques à votre questionnaire.
          </p>

          <DialogFooter className="flex justify-center">
            <Button onClick={() => setSuccessOpen(false)}>
              OK
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>

  )

}