import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Calendar, GraduationCap, FileText } from "lucide-react"
import { getStatusLabel } from "../../utils/rubriqueType"
import { Button } from "../ui/button"
import { updateEvaluationEtat } from "../../services/EvaluationService"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog"

interface Props {
  evaluation: any
  onReload?: () => void
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


export function EvaluationHeaderView({ evaluation, onReload }: Props) {

  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleAdvanceEtat = async () => {

    let nextEtat: "DIS" | "CLO" | null = null

    if (evaluation.etat === "ELA") nextEtat = "DIS"
    if (evaluation.etat === "DIS") nextEtat = "CLO"

    if (!nextEtat) return

    try {

      await updateEvaluationEtat(evaluation.idEvaluation, nextEtat)

      setConfirmOpen(false)

      if (onReload) {
        await onReload()
      }

    } catch (error) {

      console.error(error)
    }
  }

  console.log("evaluation", evaluation)

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm py-0 gap-0">

      <CardHeader className="border-b border-gray-200 bg-gray-50 px-6 py-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {`Informations de l'évaluation : ${evaluation.designation}`}
            </CardTitle>

            <p className="text-sm text-gray-500 mt-1">
              Contexte académique, unité d’enseignement et période de réponses
            </p>
          </div>

          {evaluation.etat !== "CLO" && (

            <Button
              onClick={() => setConfirmOpen(true)}
              className={
                evaluation.etat === "ELA"
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >

              {evaluation.etat === "ELA" &&
                "Mettre l'évaluation à disposition des étudiants"}

              {evaluation.etat === "DIS" &&
                "Clôturer l'évaluation"}

            </Button>

          )}

        </div>

      </CardHeader>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>

        <DialogContent className="max-w-md">

          <DialogHeader>

            <DialogTitle>

              {evaluation.etat === "ELA"
                ? `Mettre l'évaluation "${evaluation.designation}" à disposition`
                : `Clôturer l'évaluation "${evaluation.designation}"`}

            </DialogTitle>

            <DialogDescription className="space-y-2 text-sm text-gray-600">

              {evaluation.etat === "ELA" && (
                <>
                  Cette action mettra l'évaluation à disposition des étudiants.
                  <br />
                  <span className="text-blue-600 font-medium">
                    Cette action est irréversible : vous ne pourrez plus revenir à
                    l'état "En cours d'élaboration".
                  </span>
                </>
              )}

              {evaluation.etat === "DIS" && (
                <>
                  Cette action clôturera définitivement l'évaluation.
                  <br />
                  <span className="text-blue-600 font-medium">
                    Cette action est irréversible : l'évaluation ne pourra plus être modifiée.
                  </span>
                </>
              )}

            </DialogDescription>

          </DialogHeader>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </Button>

            <Button
              onClick={handleAdvanceEtat}
              className={
                evaluation.etat === "ELA"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-600 hover:bg-green-700"
              }
            >

              {evaluation.etat === "ELA"
                ? "Mettre à disposition"
                : "Clôturer"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

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

            <Field label="État" value={getStatusLabel(evaluation.etat)} />

          </div>
        </div>

        <div className="mx-6 border-t border-gray-100" />

        {/* UE */}

        <div className="px-6 py-6">
          <SectionLabel icon={FileText}>
            Unité d'enseignement
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Unité d&apos;enseignement" value={evaluation.codeUe} />

            <Field label="Élément constitutif" value={evaluation.codeEc} />

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