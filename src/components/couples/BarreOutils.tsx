import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Plus, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";

type Props = {
    recherche: string;
    onChangerRecherche: (v: string) => void;
    ajoutOuvert: boolean;
    onToggleAjout: () => void;
};

export function BarreOutils({
                                recherche,
                                onChangerRecherche,
                                ajoutOuvert,
                                onToggleAjout,
                            }: Props) {
    return (
        <Card className="border-border/60 bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={recherche}
                            onChange={(e) => onChangerRecherche(e.target.value)}
                            placeholder="Filtrer par nom de couple..."
                            className="h-11 rounded-full bg-white pl-11 shadow-sm"
                        />
                        {recherche ? (
                            <button
                                onClick={() => onChangerRecherche("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:bg-muted"
                                aria-label="Effacer la recherche"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>

                    <Button
                        onClick={onToggleAjout}
                        className="h-11 rounded-xl bg-black px-5 font-semibold text-white shadow hover:bg-black/90 sm:w-auto"
                    >
                        {ajoutOuvert ? (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Fermer
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un couple
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
