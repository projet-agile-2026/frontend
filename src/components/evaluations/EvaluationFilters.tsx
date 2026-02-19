import { Search, Filter } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"

interface EvaluationFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onlyCurrentYear: boolean
  onToggleCurrentYear: () => void
  onNewEvaluation: () => void
}

export function EvaluationFilters({
  search,
  onSearchChange,
  onlyCurrentYear,
  onToggleCurrentYear,
  onNewEvaluation,
}: EvaluationFiltersProps) {
  return (
    <Card className="border-border/60 bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <CardContent className="p-3 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher (formation, UE...)"
              className="h-10 sm:h-11 rounded-xl bg-white pl-9 shadow-sm w-full"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant={onlyCurrentYear ? "default" : "outline"}
              onClick={onToggleCurrentYear}
              className={`h-10 sm:h-11 rounded-xl px-4 text-sm font-medium w-full sm:w-auto ${
                onlyCurrentYear
                  ? "bg-black text-white hover:bg-black/90"
                  : "bg-white"
              }`}
            >
              <Filter className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Année en cours</span>
            </Button>

            <Button
              type="button"
              onClick={onNewEvaluation}
              className="h-10 sm:h-11 rounded-xl bg-black px-4 sm:px-5 font-semibold text-white shadow hover:bg-black/90 w-full sm:w-auto"
            >
              + Nouvelle évaluation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

