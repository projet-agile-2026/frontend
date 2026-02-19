import { useEffect, useMemo, useState } from "react";
import {
  getQualificatifs,
  createQualificatif,
  updateQualificatif,
  deleteQualificatif,
  type QualificatifDTO as Couple
} from "../services/Qualificatifservice"
import { getQuestions, type Question, } from "../services/Questionservice"
import { BarreOutils } from "../components/couples/BarreOutils";
import { AjoutCouple } from "../components/couples/AjoutCouple";
import { ListeCouples } from "../components/couples/ListeCouples";

import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"  


function normaliser(s: string) {
    return s.trim().toLowerCase();
}

function existeDeja(couples: Couple[], mot1: string, mot2: string) {
    const a = normaliser(mot1);
    const b = normaliser(mot2);

    return couples.some((c) => {
        const c1 = normaliser(c.mot1);
        const c2 = normaliser(c.mot2);
        // même ordre OU inversé (au cas où)
        return (c1 === a && c2 === b) || (c1 === b && c2 === a);
    });
}

export function PageCouples() {
    const [chargement, setChargement] = useState(true);
    const [couples, setCouples] = useState<Couple[]>([]);

    const [recherche, setRecherche] = useState("");

    const [ajoutOuvert, setAjoutOuvert] = useState(false);
    const [mot1Nouveau, setMot1Nouveau] = useState("");
    const [mot2Nouveau, setMot2Nouveau] = useState("");

    const [idEdition, setIdEdition] = useState<number | null>(null);
    const [mot1Edition, setMot1Edition] = useState("");
    const [mot2Edition, setMot2Edition] = useState("");

    // POPUP doublon
    const [popupDoublonOuvert, setPopupDoublonOuvert] = useState(false);
    const [messageDoublon, setMessageDoublon] = useState("");

    // CONFIRM suppression
    const [confirmSuppOuvert, setConfirmSuppOuvert] = useState(false);
    const [idASupprimer, setIdASupprimer] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    async function charger() {
        const [couplesData, questionsData] = await Promise.all([
            getQualificatifs(),
            getQuestions()
        ]);
        setCouples(couplesData);
        setQuestions(questionsData);
    }

    useEffect(() => {
        (async () => {
            try {
                await charger();
            } finally {
                setChargement(false);
            }
        })();
    }, []);

    const listeAffichee = useMemo(() => {
        const q = normaliser(recherche);

        const filtre = couples.filter((c) => {
            if (!q) return true;
            return normaliser(`${c.mot1} ${c.mot2}`).includes(q);
        });

        return filtre.sort((a, b) =>
            `${a.mot1} ${a.mot2}`.localeCompare(`${b.mot1} ${b.mot2}`, "fr", {
                sensitivity: "base",
            })
        );
    }, [couples, recherche]);

    // ✅ AJOUT (avec blocage doublon + toast)
    async function ajouter() {
        const mot1 = mot1Nouveau.trim();
        const mot2 = mot2Nouveau.trim();
        if (!mot1 || !mot2) {
            toast.warning("Champs manquants", { description: "Couples qualificatif est obligatoire." });
            return;
        }

        if (existeDeja(couples, mot1, mot2)) {
            setMessageDoublon(`Le couple "${mot1} / ${mot2}" existe déjà.`);
            setPopupDoublonOuvert(true);
            toast.error("Doublon détecté", { description: "Impossible d’ajouter un couple déjà existant." });
            return;
        }

        await createQualificatif({ mot1, mot2 });
        await charger();

        setMot1Nouveau("");
        setMot2Nouveau("");
        setAjoutOuvert(false);

        toast.success("Ajout effectué", { description: `Couple "${mot1}" + "${mot2}" ajouté.` });
    }

    function demarrerEdition(c: Couple) {
        setIdEdition(c.id ?? null);
        setMot1Edition(c.mot1);
        setMot2Edition(c.mot2);
    }

    function estUtilise(id?: number) {
        return questions.some(q => q.idQualificatif === id);
    }

    function annulerEdition() {
        setIdEdition(null);
        setMot1Edition("");
        setMot2Edition("");
    }

    // ✅ MODIF (avec blocage doublon + toast)
    async function sauvegarderEdition() {
        if (!idEdition) return;

        const mot1 = mot1Edition.trim();
        const mot2 = mot2Edition.trim();
        if (!mot1 || !mot2) {
            toast.warning("Champs manquants", { description: "Couples qualificatif est obligatoire." });
            return;
        }

        // Si ça devient un doublon (en excluant l’élément courant)
        const couplesSansCourant = couples.filter((c) => c.idQualificatif !== idEdition);
        if (existeDeja(couplesSansCourant, mot1, mot2)) {
            setMessageDoublon(`Le couple "${mot1} / ${mot2}" existe déjà.`);
            setPopupDoublonOuvert(true);
            toast.error("Doublon détecté", { description: "Impossible d’enregistrer un doublon." });
            return;
        }

        await updateQualificatif(idEdition, { mot1, mot2 });
        await charger();
        annulerEdition();

        toast.success("Modification enregistrée", { description: `Couple mis à jour.` });
    }

    // ✅ Demande de suppression (ouvre confirm)
    function demanderSuppression(id: number) {
        setIdASupprimer(id);
        setConfirmSuppOuvert(true);
    }

    // ✅ Suppression confirmée
    async function supprimerConfirme() {
        if (idASupprimer == null) return;

        if (idEdition === idASupprimer) annulerEdition();

        await deleteQualificatif(idASupprimer);
        await charger();

        setConfirmSuppOuvert(false);
        setIdASupprimer(null);

        toast.success("Supprimé", { description: "Le couple a été supprimé avec succès." }); // ✅ toast vert
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
                {/* Header minimal (plus de bouton + plus de sous-titre) */}
                <div className="flex items-end justify-between">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">COUPLES QUALIFICATIFS</h1>
                </div>

                <div className="mt-7 grid gap-4">
                    <BarreOutils
                        recherche={recherche}
                        onChangerRecherche={setRecherche}
                        ajoutOuvert={ajoutOuvert}
                        onToggleAjout={() => setAjoutOuvert((v) => !v)}
                    />

                    <AjoutCouple
                        ouvert={ajoutOuvert}
                        mot1={mot1Nouveau}
                        mot2={mot2Nouveau}
                        onChangerMot1={setMot1Nouveau}
                        onChangerMot2={setMot2Nouveau}
                        onValider={ajouter}
                    />

                    <ListeCouples
                        chargement={chargement}
                        couples={listeAffichee}
                        questions={questions}
                        idEdition={idEdition}
                        mot1Edition={mot1Edition}
                        mot2Edition={mot2Edition}
                        onDemarrerEdition={demarrerEdition}
                        onAnnulerEdition={annulerEdition}
                        onSauvegarderEdition={sauvegarderEdition}
                        // ⚠️ On ne supprime plus direct : on demande confirmation
                        onSupprimer={demanderSuppression}
                        onChangerMot1Edition={setMot1Edition}
                        onChangerMot2Edition={setMot2Edition}
                    />
                </div>
            </div>

            {/* Popup shadcn "doublon" */}
            <Dialog open={popupDoublonOuvert} onOpenChange={setPopupDoublonOuvert}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Doublon</DialogTitle>
                        <DialogDescription>{messageDoublon || "Ce couple existe déjà."}</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Confirmation suppression */}
            <AlertDialog open={confirmSuppOuvert} onOpenChange={setConfirmSuppOuvert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est définitive. Voulez-vous vraiment supprimer ce couple ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={supprimerConfirme}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
