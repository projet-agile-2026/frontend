import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getQuestionnaires,
  deleteQuestionnaire
} from "../../services/QuestionnaireService"
import { QuestionnairesTable } from "@/components/Questionnaire/QuestionnairesTable"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function QuestionnairesPage() {

  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState([])

  const [selectedToDelete, setSelectedToDelete] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {

    const data = await getQuestionnaires()
    setQuestionnaires(data)

  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = (q: any) => {
    setSelectedToDelete(q)
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

      <Dialog open={!!selectedToDelete} onOpenChange={() => setSelectedToDelete(null)}>

        <DialogContent className="max-w-md">

          <DialogHeader>
            <DialogTitle>
              Supprimer le questionnaire
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir supprimer
            <span className="font-semibold"> "{selectedToDelete?.designation}" </span> ?
            <br />
            Cette action est irréversible.
          </p>

          <DialogFooter className="flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() => setSelectedToDelete(null)}
            >
              Annuler
            </Button>

            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={async () => {
                if (!selectedToDelete) return

                try {
                  setDeleteLoading(true)

                  await deleteQuestionnaire(selectedToDelete.idQuestionnaire)

                  setSelectedToDelete(null)
                  await load()

                  toast.success("Questionnaire supprimé avec succès")

                } finally {
                  setDeleteLoading(false)
                }
              }}
            >
              {deleteLoading ? "Suppression..." : "Supprimer"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  )



}