import type { Couple } from "../../services/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
    return (
        <div className="relative">
            {/* Accent jaune (fin et discret) */}
            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-400/90" />

            <div className="grid grid-cols-[1.2fr_1.2fr_120px] items-center gap-3 px-5 py-3 pl-6 transition hover:bg-muted/30">
                {enEdition ? (
                    <>
                        <Input
                            value={mot1Edition}
                            onChange={(e) => onChangerMot1Edition(e.target.value)}
                            placeholder="Mot 1"
                            className="h-10 rounded-xl bg-white shadow-sm"
                        />
                        <Input
                            value={mot2Edition}
                            onChange={(e) => onChangerMot2Edition(e.target.value)}
                            placeholder="Mot 2"
                            className="h-10 rounded-xl bg-white shadow-sm"
                        />

                        <div className="flex items-center justify-end gap-2">
                            <Button onClick={onSauvegarderEdition} className="h-10 rounded-xl px-3">
                                ✔
                            </Button>
                            <Button
                                onClick={onAnnulerEdition}
                                className="h-10 rounded-xl px-3 border bg-white text-foreground hover:bg-muted"
                            >
                                ✖
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mot 1 */}
                        <button
                            onClick={onDemarrerEdition}
                            className="truncate text-left text-sm font-semibold"
                            title="Cliquer pour modifier"
                            type="button"
                        >
                            {couple.mot1}

                        </button>

                        {/* Mot 2 */}
                        <button
                            onClick={onDemarrerEdition}
                            className="truncate text-left text-sm font-semibold"
                            title="Cliquer pour modifier"
                            type="button"
                        >
                            {couple.mot2}
                        </button>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2">
                            <Badge variant="secondary" className="h-7 rounded-full px-3 text-xs">
                                {couple.count}
                            </Badge>

                            <Button
                                onClick={onSupprimer}
                                className="h-10 w-10 rounded-xl px-0 border bg-white text-foreground hover:bg-muted"
                                title="Supprimer"
                            >
                                −
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
