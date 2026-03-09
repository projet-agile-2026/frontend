import { Search, Filter, ListFilter } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import type { EvaluationStatus } from "../../services/EvaluationService"
import { Check } from "lucide-react"

interface EvaluationFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  academicYearActive: boolean
  onToggleCurrentYear: () => void
  selectedStates: EvaluationStatus[]
  onToggleState: (state: EvaluationStatus) => void
  onClearStates: () => void
  onNewEvaluation: () => void
  showTeacherActions?: boolean
}

export function EvaluationFilters({
  search,
  onSearchChange,
  academicYearActive,
  onToggleCurrentYear,
  selectedStates,
  onToggleState,
  onClearStates,
  onNewEvaluation,
  showTeacherActions = true,
}: EvaluationFiltersProps) {
  const stateCount = selectedStates.length
  const stateButtonActive = stateCount > 0

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
              variant={academicYearActive ? "default" : "outline"}
              onClick={onToggleCurrentYear}
              className={`h-10 sm:h-11 rounded-xl px-4 text-sm font-medium w-full sm:w-auto ${
                academicYearActive
                  ? "bg-black text-white hover:bg-black/90"
                  : "bg-white"
              }`}
            >
              <Filter className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Année en cours</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant={stateButtonActive ? "default" : "outline"}
                  className={`h-10 sm:h-11 rounded-xl px-4 text-sm font-medium w-full sm:w-auto ${
                    stateButtonActive
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-white"
                  }`}
                >
                  <ListFilter className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">État</span>
                  {stateCount > 0 && (
                    <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                      {stateCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuLabel>Filtrer par état</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedStates.includes("ELA")}
                  onCheckedChange={() => onToggleState("ELA")}
                  className={`cursor-pointer ${
                    selectedStates.includes("ELA")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span>ELA — En cours d’élaboration</span>
                  {selectedStates.includes("ELA") && (
                    <Check className="h-4 w-4 text-blue" />
                  )}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStates.includes("DIS")}
                  onCheckedChange={() => onToggleState("DIS")}
                  className={`cursor-pointer ${
                    selectedStates.includes("DIS")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span>DIS — Mise à disposition</span>
                  {selectedStates.includes("DIS") && (
                    <Check className="h-4 w-4 text-blue" />
                  )}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStates.includes("CLO")}
                  onCheckedChange={() => onToggleState("CLO")}
                  className={`cursor-pointer ${
                    selectedStates.includes("CLO")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span>CLO — Clôturée</span>
                  {selectedStates.includes("CLO") && (
                    <Check className="h-4 w-4 text-blue" />
                  )}
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={onClearStates}
                  disabled={selectedStates.length === 0}
                >
                  Réinitialiser
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            {showTeacherActions && (
              <Button
                type="button"
                onClick={onNewEvaluation}
                className="h-10 sm:h-11 rounded-xl bg-black px-4 sm:px-5 font-semibold text-white shadow hover:bg-black/90 w-full sm:w-auto"
              >
                + Nouvelle évaluation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

