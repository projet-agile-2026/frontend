import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Eye, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
  getStatistiques,
  exportStatistiquesPdf,
  type StatistiquesEvaluationDTO,
  type QuestionStatDTO,
  type RubriqueStatDTO,
} from "../../services/EvaluationService"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"

// ── Couleur selon moyenne 1→5 (rouge → orange → vert) ────────────────────────
// Utilise HSL pour un spectre plus contrasté et fidèle (rouge=0°, vert=120°)
function getMoyenneColor(moyenne: number | null): string {
  if (moyenne === null) return "#9ca3af"
  const ratio = Math.max(0, Math.min(1, (moyenne - 1) / 4)) // 0 à 1
  // hue: 0° (rouge) → 120° (vert) avec légère saturation et luminosité stables
  const hue = Math.round(ratio * 120)
  return `hsl(${hue}, 75%, 40%)`
}

// Couleur des barres du BarChart (même spectre, une couleur par positionnement)
function getBarColor(positionnement: number): string {
  return getMoyenneColor(positionnement)
}

// ── Modale détail question ────────────────────────────────────────────────────
function QuestionModal({
  question,
  onClose,
}: {
  question: QuestionStatDTO
  onClose: () => void
}) {
  // Données pour le BarChart horizontal (toutes les valeurs, même à 0)
  const chartData = [
    { label: `1 – ${question.minimal}`, value: question.nb1, pos: 1 },
    { label: "2", value: question.nb2, pos: 2 },
    { label: "3", value: question.nb3, pos: 3 },
    { label: "4", value: question.nb4, pos: 4 },
    { label: `5 – ${question.maximal}`, value: question.nb5, pos: 5 },
  ]

  const stats = [
    { label: "Répondants", value: question.nbRepondants },
    { label: "Moyenne", value: question.moyenne !== null ? question.moyenne.toFixed(2) : "—" },
    { label: "Médiane", value: question.mediane !== null ? question.mediane.toFixed(1) : "—" },
    { label: "Minimum", value: question.minimum ?? "—" },
    { label: "Maximum", value: question.maximum ?? "—" },
    { label: "Écart-type", value: question.ecartType !== null ? question.ecartType.toFixed(2) : "—" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {question.intitule}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {question.minimal} → {question.maximal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors ml-4 shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* BarChart horizontal — Distribution des réponses */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Distribution des réponses
          </p>
          {question.nbRepondants > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={100}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} répondant${value > 1 ? "s" : ""}`, ""]}
                  labelFormatter={(label) => label}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {chartData.map((entry) => (
                    <Cell key={entry.pos} fill={getBarColor(entry.pos)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Aucune réponse pour cette question
            </div>
          )}
        </div>

        {/* Statistiques en grille */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2 mt-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-gray-50 rounded-lg px-3 py-2 text-center"
              >
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Badge moyenne avec barre de progression ───────────────────────────────────
function MoyenneBadge({ moyenne }: { moyenne: number | null }) {
  const color = getMoyenneColor(moyenne)
  const ratio = moyenne !== null ? ((moyenne - 1) / 4) * 100 : 0

  return (
    <div className="relative flex flex-col items-center gap-1 min-w-[56px] group">
      {/* Tooltip au survol */}
      {moyenne !== null && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
          bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-44
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 shadow-lg text-center z-50">
          <p className="font-semibold text-sm mb-1" style={{ color }}>
            {moyenne.toFixed(2)} / 5
          </p>
          <p className="text-gray-300">
            {moyenne >= 4.5 ? "Très satisfaisant" :
             moyenne >= 3.5 ? "Satisfaisant" :
             moyenne >= 2.5 ? "Moyen" :
             moyenne >= 1.5 ? "Insuffisant" : "Très insuffisant"}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div className="h-1 rounded-full" style={{ width: `${ratio}%`, backgroundColor: color }} />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
      {/* Badge chiffre */}
      <div
        className="text-white font-bold text-sm rounded-lg px-3 py-1.5 w-full text-center leading-none"
        style={{ backgroundColor: color }}
      >
        {moyenne !== null ? moyenne.toFixed(1) : "—"}
        <span className="font-normal text-white/70 text-xs ml-0.5">/5</span>
      </div>
      {/* Mini barre de progression */}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${ratio}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export function StatistiquesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [stats, setStats] = useState<StatistiquesEvaluationDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionStatDTO | null>(null)

  useEffect(() => {
    if (id) {
      getStatistiques(Number(id))
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-20">
        Statistiques introuvables
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Statistiques — {stats.designation}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/evaluations/${id}`)}>
            Retour
          </Button>
          <Button variant="outline" onClick={() => exportStatistiquesPdf(Number(id))}>
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="bg-white border rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-400">Formation</p>
          <p className="font-medium text-gray-900">{stats.codeFormation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Année universitaire</p>
          <p className="font-medium text-gray-900">{stats.anneeUniversitaire}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Période</p>
          <p className="font-medium text-gray-900">{stats.periode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Répondants</p>
          <p className="font-medium text-gray-900">{stats.totalRepondants}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Unité d'enseignement</p>
          <p className="font-medium text-gray-900">{stats.codeUe}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Élément constitutif</p>
          <p className="font-medium text-gray-900">{stats.codeEc ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Début réponses</p>
          <p className="font-medium text-gray-900">{stats.debutReponse}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Fin réponses</p>
          <p className="font-medium text-gray-900">{stats.finReponse}</p>
        </div>
      </div>

      {/* Rubriques */}
      {stats.rubriques.map((rubrique: RubriqueStatDTO) => (
        <div
          key={rubrique.idRubriqueEvaluation}
          className="bg-white border rounded-xl"
        >
          {/* Titre rubrique */}
          <div className="bg-gray-50 border-b px-6 py-3">
            <h2 className="font-semibold text-gray-700 text-xs uppercase tracking-widest">
              {rubrique.designation}
            </h2>
          </div>

          {/* Questions */}
          <div className="divide-y overflow-visible">
            {rubrique.questions.map((question: QuestionStatDTO) => (
              <div
                key={question.idQuestionEvaluation}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/60 transition-colors"
              >
                {/* Intitulé + qualificatifs */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm text-gray-900 font-medium">
                    {question.intitule}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {question.minimal} → {question.maximal}
                  </p>
                </div>

                {/* Badge moyenne + bouton œil */}
                <div className="flex items-center gap-3">
                  <MoyenneBadge moyenne={question.moyenne} />

                  <button
                    onClick={() => setSelectedQuestion(question)}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-300 hover:text-gray-600"
                    title="Voir le détail"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modale */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  )
}