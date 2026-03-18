import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getEvaluationsEtudiant, type EvaluationEtudiantDTO } from "../../services/EvaluationReponseService"
import { Loader2, AlertCircle, BookOpen } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

const ETAT_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  DIS: { label: "Mise à disposition", variant: "success" },
  CLO: { label: "Clôturée", variant: "secondary" },
}

export function EtudiantEvaluationsPage() {
  const navigate = useNavigate()
  const [evaluations, setEvaluations] = useState<EvaluationEtudiantDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEvaluationsEtudiant()
      
      // Trier les évaluations : DIS d'abord, puis CLO, et par date de fin croissante
      const sorted = data.sort((a, b) => {
        // 1. Trier par état : DIS avant CLO
        if (a.etat === "DIS" && b.etat === "CLO") return -1
        if (a.etat === "CLO" && b.etat === "DIS") return 1
        
        // 2. Si même état, trier par date de fin (la plus tôt en premier)
        const dateA = a.finReponse ? new Date(a.finReponse).getTime() : Infinity
        const dateB = b.finReponse ? new Date(b.finReponse).getTime() : Infinity
        return dateA - dateB
      })
      
      setEvaluations(sorted)
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des évaluations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvaluations()
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des évaluations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={loadEvaluations}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mes Évaluations
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Retrouvez toutes les évaluations disponibles pour votre promotion.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Aucune évaluation disponible pour le moment.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Enseignant</TableHead>
                  <TableHead className="font-semibold">Unité d'enseignement</TableHead>
                  <TableHead className="font-semibold">N° Évaluation</TableHead>
                  <TableHead className="font-semibold">État</TableHead>
                  <TableHead className="font-semibold">Fin de réponse</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => {
                  const etatInfo = ETAT_LABELS[evaluation.etat] || { label: evaluation.etat, variant: "default" }
                  
                  return (
                    <TableRow key={evaluation.idEvaluation} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {evaluation.prenomEnseignant} {evaluation.nomEnseignant}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{evaluation.codeUe}</span>
                          <span className="text-xs text-gray-500">{evaluation.codeEc}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {evaluation.noEvaluation || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={etatInfo.variant}>
                          {etatInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(evaluation.finReponse)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {/* Bouton Voir résultat - uniquement si déjà répondu */}
                          {evaluation.dejaRepondu && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/mes-evaluations/${evaluation.idEvaluation}/resultat`)}
                            >
                              Voir résultat
                            </Button>
                          )}
                          
                          {/* Bouton Répondre/Modifier - uniquement pour les évaluations DIS */}
                          {evaluation.etat === "DIS" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/mes-evaluations/${evaluation.idEvaluation}/repondre`)}
                            >
                              {evaluation.dejaRepondu ? "Modifier ma réponse" : "Répondre"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
