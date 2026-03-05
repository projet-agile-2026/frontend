import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

type Props = {
    ouvert: boolean;
    mot1: string;
    mot2: string;
    onChangerMot1: (v: string) => void;
    onChangerMot2: (v: string) => void;
    onValider: () => void;
    onFermer: () => void;
};

export function AjoutCouple({
                                ouvert,
                                mot1,
                                mot2,
                                onChangerMot1,
                                onChangerMot2,
                                onValider,
                                onFermer,
                            }: Props) {
    return (
        <Dialog open={ouvert} onOpenChange={(open) => { if (!open) onFermer(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter un couple de qualificatifs</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                    <Input
                        value={mot2}
                        onChange={(e) => onChangerMot2(e.target.value)}
                        placeholder="Minimal"
                        className="h-11 rounded-xl bg-white shadow-sm"
                    />
                    <Input
                        value={mot1}
                        onChange={(e) => onChangerMot1(e.target.value)}
                        placeholder="Maximal"
                        className="h-11 rounded-xl bg-white shadow-sm"
                    />
                    <Button onClick={onValider} className="h-11 rounded-xl w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Valider
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}