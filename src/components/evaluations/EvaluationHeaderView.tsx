import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Calendar, GraduationCap, FileText } from "lucide-react"

interface Props {
  evaluation: any
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

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "-"}</p>
    </div>
  )
}

export function EvaluationHeaderView({ evaluation }: Props) {
  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm py-0 gap-0">

      <CardHeader className="border-b border-gray-200 bg-gray-50 px-6 py-5">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {`Informations de l'évaluation : ${evaluation.designation}`}
        </CardTitle>

        <p className="text-sm text-gray-500 mt-1">
          Contexte académique, unité d’enseignement et période de réponses
        </p>
      </CardHeader>

      <CardContent className="p-0">

        {/* Contexte académique */}

        <div className="px-6 py-6">
          <SectionLabel icon={GraduationCap}>
            Contexte académique
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <Field label="Code Formation" value={evaluation.codeFormation} />

            <Field
              label="Année universitaire"
              value={evaluation.anneeUniversitaire}
            />

            <Field label="Période" value={evaluation.periode} />

            <Field label="État" value={evaluation.etat} />

          </div>
        </div>

        <div className="mx-6 border-t border-gray-100" />

        {/* UE */}

        <div className="px-6 py-6">
          <SectionLabel icon={FileText}>
            Unité d'enseignement
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="UE" value={evaluation.codeUe} />

            <Field label="EC" value={evaluation.codeEc} />

            <Field label="Désignation" value={evaluation.designation} />

          </div>
        </div>

        <div className="mx-6 border-t border-gray-100" />

        {/* Période */}

        <div className="px-6 py-6">
          <SectionLabel icon={Calendar}>
            Période de réponses
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <Field
              label="Date début réponses"
              value={new Date(evaluation.debutReponse).toLocaleDateString()}
            />

            <Field
              label="Date fin réponses"
              value={new Date(evaluation.finReponse).toLocaleDateString()}
            />

            <Field label="Numéro d'évaluation" value={evaluation.noEvaluation} />

          </div>
        </div>

      </CardContent>

    </Card>
  )
}