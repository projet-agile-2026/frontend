import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Edit3, Trash2, Check, X } from "lucide-react";
import type { QualificatifDTO as Couple } from "../../services/Qualificatifservice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
type Props = {
  couple: Couple;
  enEdition: boolean;
  mot1Edition: string;
  mot2Edition: string;

  onChangerMot1Edition: (v: string) => void;
  onChangerMot2Edition: (v: string) => void;

  onDemarrerEdition: () => void;
  onAnnulerEdition: () => void;
  onSauvegarderEdition: () => void;
  onSupprimer: () => void;
};

export function LigneCouple({
  couple,
  enEdition,
  mot1Edition,
  mot2Edition,
  onChangerMot1Edition,
  onChangerMot2Edition,
  onDemarrerEdition,
  onAnnulerEdition,
  onSauvegarderEdition,
  onSupprimer,
}: Props) {
  const isUsed = (couple.count ?? 0) > 0;

  return (
    <div className="grid grid-cols-[1.2fr_1.2fr_80px_120px] gap-3 px-5 py-4 items-center">
      {/* Minimal */}
      <div>
        {enEdition ? (
          <Input value={mot2Edition} onChange={(e) => onChangerMot2Edition(e.target.value)} />
        ) : (
          <span className="font-semibold uppercase">{couple.mot2}</span>
        )}
      </div>
        {/* Maximal */}
        <div>
            {enEdition ? (
                <Input value={mot1Edition} onChange={(e) => onChangerMot1Edition(e.target.value)} />
            ) : (
                <span className="font-semibold uppercase">{couple.mot1}</span>
            )}
        </div>
      {/* COUNT */}
      <div className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
        <span className={`inline-flex items-center justify-center h-7 min-w-[30px] px-2 text-xs font-bold rounded-full cursor-default
          ${isUsed ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
          {couple.count ?? 0}
        </span>
            </TooltipTrigger>
            <TooltipContent>
              {isUsed ? `Utilisé dans ${couple.count} question(s)` : "Aucune question liée"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {enEdition ? (
          <>
            <Button size="icon" variant="ghost" onClick={onSauvegarderEdition}>
              <Check size={16} />
            </Button>
            <Button size="icon" variant="ghost" onClick={onAnnulerEdition}>
              <X size={16} />
            </Button>
          </>
        ) : (
          <>
            {/* EDIT */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
      <span>
        <Button
            variant="ghost" size="icon"
            disabled={isUsed}
            className={`h-8 w-8 rounded-lg border border-slate-100 shadow-sm ${isUsed ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-blue-600"}`}
            onClick={() => { if (!isUsed) onDemarrerEdition(); }}
        >
          <Edit3 size={14} />
        </Button>
      </span>
                    </TooltipTrigger>
                    <TooltipContent>{isUsed ? "Couple de qualificatifs utilisé dans une question : modification interdite" : "Modifier"}</TooltipContent>
                </Tooltip>

            {/* DELETE */}
                <Tooltip>
                    <TooltipTrigger asChild>
      <span>
        <Button
            variant="ghost" size="icon"
            disabled={isUsed}
            className={`h-8 w-8 rounded-lg border border-slate-100 shadow-sm ${isUsed ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-red-600"}`}
            onClick={() => { if (!isUsed) onSupprimer(); }}
        >
          <Trash2 size={14} />
        </Button>
      </span>
                    </TooltipTrigger>
                    <TooltipContent>{isUsed ? "Couple de qualificatifs utilisé dans une question : suppression interdite" : "Supprimer"}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
}
