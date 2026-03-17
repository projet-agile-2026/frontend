import { Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "../../components/ui/button"

export interface QuestionnaireListItem {

  idQuestionnaire: number
  designation: string

}

interface Props {

  questionnaires: QuestionnaireListItem[]
  onEdit?: (q: QuestionnaireListItem) => void
  onDelete?: (q: QuestionnaireListItem) => void
  onView?: (q: QuestionnaireListItem) => void

}

export function QuestionnairesTable({
  questionnaires,
  onEdit,
  onDelete,
  onView
}: Props) {

  return (

    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

      <table className="w-full divide-y divide-gray-200">

        <thead className="bg-gray-50">

          <tr className="text-xs uppercase text-gray-500">

            <th className="px-4 py-3 text-left">
              Désignation
            </th>

            <th className="px-4 py-3 text-right">
              Actions
            </th>

          </tr>

        </thead>

        <tbody className="divide-y">

          {questionnaires.length === 0 ? (

            <tr>

              <td colSpan={2} className="text-center py-6 text-gray-400">
                Aucun questionnaire
              </td>

            </tr>

          ) : (

            questionnaires.map((q) => (

              <tr key={q.idQuestionnaire}>

                <td className="px-4 py-3">
                  {q.designation}
                </td>

                <td className="px-4 py-3 text-right">

                  <div className="flex justify-end gap-2">

                    {onView && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onView(q)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {onEdit && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(q)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-200 text-red-600"
                        onClick={() => onDelete(q)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  )

}