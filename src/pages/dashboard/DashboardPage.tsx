import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  Layers3,
  ListChecks,
  Timer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EvaluationListItem, EvaluationStatus } from "@/services/EvaluationService"

const CURRENT_YEAR = "2024-2025"

type StatConfig = {
  label: string
  value: number
  icon: React.ReactNode
}

const mockRecentEvaluations: EvaluationListItem[] = [
  {
    idEvaluation: 101,
    anneeUniversitaire: "2024-2025",
    codeFormation: "MINFO",
    libelleFormation: "Master Informatique",
    codeUe: "UE01",
    libelleUe: "Architecture logicielle",
    etat: "DIS",
    periode: "S1",
    debutReponse: "2024-09-15",
    finReponse: "2024-10-01",
  },
  {
    idEvaluation: 102,
    anneeUniversitaire: "2024-2025",
    codeFormation: "L3INFO",
    libelleFormation: "Licence 3 Informatique",
    codeUe: "UE03",
    libelleUe: "Bases de données",
    etat: "ELA",
    periode: "S1",
    debutReponse: "2024-10-10",
    finReponse: "2024-10-25",
  },
  {
    idEvaluation: 103,
    anneeUniversitaire: "2023-2024",
    codeFormation: "MINFO",
    libelleFormation: "Master Informatique",
    codeUe: "UE05",
    libelleUe: "IA avancée",
    etat: "CLO",
    periode: "S2",
    debutReponse: "2024-03-01",
    finReponse: "2024-03-20",
  },
]

export function DashboardPage() {
  const navigate = useNavigate()

  // Mocked counts by status
  const stats = useMemo(() => {
    const total = 42
    const ela = 12
    const dis = 18
    const clo = 12
    return { total, ela, dis, clo }
  }, [])

  const distribution = useMemo(() => {
    const total = stats.total || 1
    const elaPct = Math.round((stats.ela / total) * 100)
    const disPct = Math.round((stats.dis / total) * 100)
    const cloPct = Math.max(0, 100 - elaPct - disPct)
    return {
      elaPct,
      disPct,
      cloPct,
    }
  }, [stats])

  const statCards: StatConfig[] = [
    {
      label: "Total évaluations",
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5 text-slate-700" />,
    },
    {
      label: "En élaboration (ELA)",
      value: stats.ela,
      icon: <ClipboardList className="h-5 w-5 text-slate-700" />,
    },
    {
      label: "En cours (DIS)",
      value: stats.dis,
      icon: <Timer className="h-5 w-5 text-slate-700" />,
    },
    {
      label: "Clôturées (CLO)",
      value: stats.clo,
      icon: <CheckCircle2 className="h-5 w-5 text-slate-700" />,
    },
  ]

  const getStatusLabel = (etat: EvaluationStatus) => {
    switch (etat) {
      case "ELA":
        return "Élaboration"
      case "DIS":
        return "En cours"
      case "CLO":
        return "Clôturée"
      default:
        return etat
    }
  }

  const getStatusBadgeVariant = (etat: EvaluationStatus) => {
    switch (etat) {
      case "ELA":
        return "secondary" as const
      case "DIS":
        return "default" as const
      case "CLO":
        return "outline" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Tableau de bord
            </h1>
            <Badge variant="secondary" className="rounded-full hidden sm:inline-flex">
              Année universitaire {CURRENT_YEAR}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Suivez vos évaluations, visualisez leur état et accédez rapidement aux actions clés.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Badge variant="outline" className="rounded-full text-xs px-3 py-1">
            Espace enseignant
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status distribution */}
        <Card className="border border-gray-200/80 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Layers3 className="h-4 w-4 text-gray-600" />
              Répartition des états d&apos;évaluation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full w-full">
                <div
                  className="h-full bg-slate-500"
                  style={{ width: `${distribution.elaPct}%` }}
                />
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${distribution.disPct}%` }}
                />
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${distribution.cloPct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>ELA</span>
                <span className="ml-auto font-semibold">
                  {distribution.elaPct}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>DIS</span>
                <span className="ml-auto font-semibold">
                  {distribution.disPct}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>CLO</span>
                <span className="ml-auto font-semibold">
                  {distribution.cloPct}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent evaluations */}
        <Card className="border border-gray-200/80 shadow-sm bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ListChecks className="h-4 w-4 text-gray-600" />
              Évaluations récentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate("/evaluations")}
            >
              Voir toutes
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left">Année</th>
                    <th className="px-4 py-3 text-left">Formation</th>
                    <th className="px-4 py-3 text-left">UE</th>
                    <th className="px-4 py-3 text-left">État</th>
                    <th className="px-4 py-3 text-left">Date fin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {mockRecentEvaluations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-gray-400"
                      >
                        Aucune évaluation récente.
                      </td>
                    </tr>
                  ) : (
                    mockRecentEvaluations.map((evaluation) => (
                      <tr
                        key={evaluation.idEvaluation}
                        className="hover:bg-gray-50/70 cursor-pointer"
                        onClick={() =>
                          navigate(`/evaluations/${evaluation.idEvaluation}/view`)
                        }
                      >
                        <td className="px-4 py-3">
                          {evaluation.anneeUniversitaire}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 truncate">
                              {evaluation.libelleFormation ||
                                evaluation.codeFormation}
                            </span>
                            {evaluation.libelleFormation && (
                              <span className="text-xs text-gray-500">
                                {evaluation.codeFormation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="truncate">
                              {evaluation.libelleUe || evaluation.codeUe}
                            </span>
                            {evaluation.libelleUe && (
                              <span className="text-xs text-gray-500">
                                {evaluation.codeUe}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={getStatusBadgeVariant(evaluation.etat)}
                            className="rounded-full px-2.5 py-0.5 text-xs"
                          >
                            {getStatusLabel(evaluation.etat)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(evaluation.finReponse).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-3 space-y-3">
              {mockRecentEvaluations.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                  Aucune évaluation récente.
                </div>
              ) : (
                mockRecentEvaluations.map((evaluation) => (
                  <div
                    key={evaluation.idEvaluation}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/evaluations/${evaluation.idEvaluation}/view`)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="text-xs text-gray-500">
                          {evaluation.anneeUniversitaire} · {evaluation.periode}
                        </div>
                        <div className="font-semibold text-gray-900 truncate">
                          {evaluation.libelleFormation ||
                            evaluation.codeFormation}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {evaluation.libelleUe || evaluation.codeUe}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fin :{" "}
                          {new Date(
                            evaluation.finReponse,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(evaluation.etat)}
                        className="rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {getStatusLabel(evaluation.etat)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border border-gray-200/80 shadow-sm bg-white">
        <CardHeader className="px-4 py-3 sm:px-6 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FilePlus2 className="h-4 w-4 text-gray-600" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button
              type="button"
              className="h-10 rounded-xl bg-black text-white hover:bg-black/90 w-full justify-start sm:justify-center"
              onClick={() => navigate("/evaluations/new")}
            >
              <FilePlus2 className="h-4 w-4 mr-2" />
              Nouvelle évaluation
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl w-full justify-start sm:justify-center"
              onClick={() => navigate("/evaluations")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir toutes les évaluations
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl w-full justify-start sm:justify-center"
              onClick={() => navigate("/promotions")}
            >
              <Layers3 className="h-4 w-4 mr-2" />
              Gestion des promotions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

