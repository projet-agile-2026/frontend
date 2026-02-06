import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Plus, Check } from "lucide-react";

type Props = {
    ouvert: boolean;
    mot1: string;
    mot2: string;
    onChangerMot1: (v: string) => void;
    onChangerMot2: (v: string) => void;
    onValider: () => void;
};

export function AjoutCouple({
                                ouvert,
                                mot1,
                                mot2,
                                onChangerMot1,
                                onChangerMot2,
                                onValider,
                            }: Props) {
    if (!ouvert) return null;

    return (
        <Card className="mt-5 border-border/60 bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <Input
                            value={mot1}
                            onChange={(e) => onChangerMot1(e.target.value)}
                            placeholder="Mot 1"
                            className="h-11 rounded-xl bg-white shadow-sm"
                        />
                    </div>

                    <div className="flex-1">
                        <Input
                            value={mot2}
                            onChange={(e) => onChangerMot2(e.target.value)}
                            placeholder="Mot 2"
                            className="h-11 rounded-xl bg-white shadow-sm"
                        />
                    </div>

                    <Button onClick={onValider} className="h-11 rounded-xl sm:w-44">
                        <Check className="mr-2 h-4 w-4" />
                        Valider
                    </Button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" />
                    Ajoute un couple de mots (ex: Clair / Confus)
                </div>
            </CardContent>
        </Card>
    );
}
