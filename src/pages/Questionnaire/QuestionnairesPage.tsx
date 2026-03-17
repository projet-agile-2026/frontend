import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getQuestionnaires,
  deleteQuestionnaire
} from "../../services/QuestionnaireService"
import { QuestionnairesTable } from "@/components/Questionnaire/QuestionnairesTable"
import { Button } from "../../components/ui/button"

export function QuestionnairesPage() {

  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState([])

  const load = async () => {

    const data = await getQuestionnaires()
    setQuestionnaires(data)

  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (q: any) => {

    await deleteQuestionnaire(q.idQuestionnaire)
    await load()

  }

  return (

    <div className="max-w-6xl mx-auto p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Questionnaires
        </h1>

        <Button onClick={() => navigate("/questionnaires/new")}>
          Nouveau questionnaire
        </Button>

      </div>

      <QuestionnairesTable
        questionnaires={questionnaires}
        onEdit={(q) =>
          navigate(`/questionnaires/${q.idQuestionnaire}/edit`)
        }
        onView={(q) =>
          navigate(`/questionnaires/${q.idQuestionnaire}`)
        }
        onDelete={handleDelete}
      />

    </div>

  )

}