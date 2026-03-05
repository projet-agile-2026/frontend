import type { QualificatifDTO as Couple } from "../../services/Qualificatifservice";
import { ScrollArea } from "../ui/scroll-area";
import { LigneCouple } from "./LigneCouple";
import { type Question } from "../../services/Questionservice";

type Props = {
  chargement: boolean;
  couples: Couple[];
  questions: Question[];

  idEdition: number | null;
  mot1Edition: string;
  mot2Edition: string;

  onDemarrerEdition: (c: Couple) => void;
  onAnnulerEdition: () => void;
  onSauvegarderEdition: () => void;
  onSupprimer: (id: number) => void;

  onChangerMot1Edition: (v: string) => void;
  onChangerMot2Edition: (v: string) => void;
};

export function ListeCouples({
  chargement,
  couples,
  questions,
  idEdition,
  mot1Edition,
  mot2Edition,
  onDemarrerEdition,
  onAnnulerEdition,
  onSauvegarderEdition,
  onSupprimer,
  onChangerMot1Edition,
  onChangerMot2Edition,
}: Props) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-sm font-semibold">Couples de qualificatifs</div>
        <div className="text-sm text-muted-foreground">
          {chargement ? "Chargement..." : `${couples.length} résultat(s)`}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1.2fr_1.2fr_80px_120px] gap-3 border-y bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Minimal</div>
        <div>Maximal</div>
        <div className="text-center">Utilisations</div>
        <div className="text-right">Actions</div>
      </div>

      <ScrollArea className="h-[62vh]">
        <div className="divide-y">
          {chargement ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : couples.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              Aucun couple.
            </div>
          ) : (
            couples.map((c) => (

              <LigneCouple
                key={c.id}
                couple={c}
                enEdition={idEdition === c.id}
                mot1Edition={mot1Edition}
                mot2Edition={mot2Edition}
                onChangerMot1Edition={onChangerMot1Edition}
                onChangerMot2Edition={onChangerMot2Edition}
                onDemarrerEdition={() => onDemarrerEdition(c)}
                onAnnulerEdition={onAnnulerEdition}
                onSauvegarderEdition={onSauvegarderEdition}
                onSupprimer={() => onSupprimer(c.id!)}
            />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
