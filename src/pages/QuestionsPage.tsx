import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
} from "../services/Questionservice"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { getQualificatifs, type QualificatifDTO } from "../services/Qualificatifservice";
import { getCurrentUser, type UserInfo } from "@/services/authService"

const MAX_INTITULE = 64;

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object") {
    const error = err as any
    return error?.response?.data?.message || error?.message || fallback
  }
  return fallback
}

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [qualificatifs, setQualificatifs] = useState<QualificatifDTO[]>([]);
  const itemsPerPage = 20;

  const [user, setUser] = useState<UserInfo | null>(null)
  const role = user?.role
  const [activeTab, setActiveTab] = useState<"QUP" | "QUS">("QUP");

  useEffect(() => {
    const init = async () => {
      const current = await getCurrentUser();
      setUser(current);
      await loadData();
    };
    init();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, qualifsData] = await Promise.all([
        getQuestions(),
        getQualificatifs(),
      ]);
      setQuestions(questionsData.sort((a, b) => a.intitule.localeCompare(b.intitule)));
      setQualificatifs(qualifsData);
    } catch (err: unknown) {
      console.error("Erreur lors du chargement des données", err);
      toast.error(getErrorMessage(err, "Erreur lors du chargement des questions."));
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => q.intitule.toLowerCase().includes(search.toLowerCase()))
      .filter(q => role !== "ENS" || q.type === activeTab)
      .sort((a, b) => a.intitule.localeCompare(b.intitule));
  }, [questions, search, activeTab, role]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentData = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = async (intitule: string, idQualif: string) => {
    try {
      const newQ = await createQuestion({ intitule, idQualificatif: Number(idQualif) });
      setQuestions(prev => [...prev, newQ].sort((a, b) => a.intitule.localeCompare(b.intitule)));
      toast.success(`Question « ${newQ.intitule} » ajoutée avec succès.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Impossible d'ajouter la question."));
    }
  };

  const handleUpdate = async (id: any, updatedIntitule: string, updatedIdQualif: string, question: Question) => {
    try {
      const updated = await updateQuestion(id, {
        intitule: updatedIntitule,
        idQualificatif: Number(updatedIdQualif),
        type: question.type,
        noEnseignant: question.noEnseignant
      });
      setQuestions(prev => prev.map(q => q.idQuestion === id ? updated : q).sort((a, b) => a.intitule.localeCompare(b.intitule)));
      toast.success(`Question « ${updated.intitule} » mise à jour.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Impossible de modifier la question."));
    }
  };

  const handleDelete = async (id: any) => {
    try {
      const questionToDelete = questions.find(q => q.idQuestion === id);
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.idQuestion !== id));
      toast.success(`Question « ${questionToDelete?.intitule} » supprimée.`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Impossible de supprimer la question."));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#FFD700]" />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white font-sans text-slate-900 py-12">
      <div className="max-w-[70%] mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestion des questions</h1>
          <AddQuestionDialog onAdd={handleAdd} qualificatifs={qualificatifs} role={role} />
        </div>

        {/* TYPE TABS */}
        {role === "ENS" && (
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab("QUS"); setCurrentPage(1); }}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "QUS" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                Questions Standard
              </button>
              <button
                onClick={() => { setActiveTab("QUP"); setCurrentPage(1); }}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "QUP" ? "bg-purple-600 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                Questions Personnelles
              </button>
            </div>
          </div>
        )}

        {/* RECHERCHE */}
        <div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Filtrer les questions..."
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl font-medium text-sm focus-visible:ring-1 focus-visible:ring-black"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 border-b py-4 px-8 text-xs font-semibold tracking-wide text-slate-500">
            <div className="col-span-8">Questions</div>
            <div className="col-span-3 text-center">Couple qualificatif</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {currentData.length > 0 ? (
              currentData.map(q => (
                <QuestionRow key={q.idQuestion} question={q} qualificatifs={qualificatifs} onDelete={handleDelete} onUpdate={handleUpdate} role={user?.role} />
              ))
            ) : (
              <div className="py-20 text-center text-slate-400 text-sm font-medium">
                Aucune question trouvée
              </div>
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <p className="text-sm font-medium text-slate-500">
              {filteredQuestions.length} entrée(s) trouvée(s)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="h-10 rounded-xl font-semibold text-xs border-slate-200 shadow-sm hover:bg-black hover:text-[#FFD700] transition-colors">
                <ChevronLeft className="h-4 w-4 mr-2" /> Précédent
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="h-10 rounded-xl font-semibold text-xs border-slate-200 shadow-sm hover:bg-black hover:text-[#FFD700] transition-colors">
                Suivant <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// --- LIGNE DU TABLEAU ---
function QuestionRow({ question, onDelete, qualificatifs, onUpdate, role }: any) {
  const qualif = qualificatifs.find((c: any) => Number(c.id) === Number(question.idQualificatif));
  const [editIntitule, setEditIntitule] = useState(question.intitule);
  const [editIdQualif, setEditIdQualif] = useState(String(question.idQualificatif));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const isUsed = question.usedInRubrique;
  const isPersonal = question.type === "QUP"
  const isStandard = question.type === "QUS"
  const isAdmin = role === "ADM"
  const isTeacher = role === "ENS"

  const canEdit = !isUsed && ((isAdmin && isStandard) || (isTeacher && isPersonal))
  const canDelete = !isUsed && ((isAdmin && isStandard) || (isTeacher && isPersonal))

  return (
    <div className="grid grid-cols-12 items-center py-5 px-8 transition-colors bg-white border-l-4 border-l-transparent hover:border-l-[#FFD700]">
      <div className="col-span-8">
        <span className="text-sm font-medium text-slate-800 leading-tight break-words">
          {question.intitule}
        </span>
      </div>

      <div className="col-span-3 flex justify-center">
        {qualif && (
          <div className="inline-flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">{qualif.mot2}</span>
            <div className="h-1 w-3 bg-slate-200 rounded-full"></div>
            <span className="text-xs font-medium text-slate-900">{qualif.mot1}</span>
          </div>
        )}
      </div>

      <div className="col-span-1 flex justify-end gap-2 relative">
        {tooltip && (
          <div className="absolute bottom-10 right-0 z-50 bg-slate-800 text-white text-xs font-medium rounded-xl px-3 py-2 shadow-xl w-52 text-center leading-tight">
            {tooltip}
          </div>
        )}

        {/* Bouton Edit */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost" disabled={!canEdit} size="icon"
              className="h-8 w-8 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 shadow-sm"
              onMouseEnter={() => { if (isStandard && isTeacher) setTooltip("Les questions standards ne peuvent pas être modifiées ou supprimées."); }}
              onMouseLeave={() => setTooltip(null)}
            >
              <Edit3 size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined} className="rounded-3xl border-t-[10px] border-t-blue-500 p-10 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight">Modifier la question</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2 text-left text-slate-900">
                <label className="text-xs font-medium text-slate-500 ml-1">Désignation</label>
                <Input
                  value={editIntitule}
                  maxLength={MAX_INTITULE}
                  onChange={(e) => { setEditIntitule(e.target.value); setEditError(null); }}
                  className={`h-12 border-2 rounded-xl font-medium text-sm ${editError ? "border-red-400" : ""}`}
                />
                <div className="flex justify-between items-center">
                  <span className="text-red-500 text-xs font-medium ml-1">{editError ?? ""}</span>
                  <span className={`text-xs font-medium ${editIntitule.length > MAX_INTITULE - 10 ? "text-red-400" : "text-slate-400"}`}>
                    {editIntitule.length}/{MAX_INTITULE}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-medium text-slate-500 ml-1">Type qualificatif</label>
                <select
                  value={editIdQualif}
                  onChange={(e) => setEditIdQualif(e.target.value)}
                  className="w-full h-12 border-2 rounded-xl font-medium text-sm text-slate-900 bg-white px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {qualificatifs.map((c: any) => (
                    <option key={c.id} value={String(c.id)}>{c.mot2} / {c.mot1}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-lg"
                onClick={() => {
                  if (!editIntitule.trim()) { setEditError("La désignation ne peut pas être vide."); return; }
                  if (editIntitule.trim().length > MAX_INTITULE) { setEditError(`Maximum ${MAX_INTITULE} caractères.`); return; }
                  onUpdate(question.idQuestion, editIntitule.trim(), editIdQualif, question);
                  setIsEditDialogOpen(false);
                }}
              >
                Mise à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bouton Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={!canDelete} variant="ghost" size="icon"
              className={`h-8 w-8 rounded-lg border border-slate-200 shadow-sm ${canDelete ? "text-slate-500 hover:text-red-600" : "text-slate-300 cursor-not-allowed"}`}
              onMouseEnter={() => { if (isStandard && isTeacher) setTooltip("Les questions standards ne peuvent pas être modifiées ou supprimées."); }}
              onMouseLeave={() => setTooltip(null)}
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border-t-[10px] border-t-red-500 p-10 bg-white shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold tracking-tight">Confirmation</AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-slate-500 text-sm break-words">
                Voulez-vous vraiment supprimer la question « {question.intitule} » ? Cette action est définitive.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-3">
              <AlertDialogCancel className="rounded-xl font-semibold text-xs h-11 border-2">Annuler</AlertDialogCancel>
              <AlertDialogAction disabled={isUsed} onClick={() => !isUsed && onDelete(question.idQuestion)} className="bg-red-500 text-white hover:bg-red-700 rounded-xl font-semibold text-xs h-11 shadow-lg px-8 transition-colors">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function AddQuestionDialog({ onAdd, qualificatifs, role }: any) {
  const [intitule, setIntitule] = useState("");
  const [idQualif, setIdQualif] = useState("");
  const [open, setOpen] = useState(false);
  const isValid = intitule.trim() !== "" && idQualif !== "" && intitule.trim().length <= MAX_INTITULE;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-[#FFD700] hover:bg-slate-800 font-semibold rounded-xl h-11 px-6 shadow-sm text-sm transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Nouveau
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-xl rounded-3xl border-t-[10px] border-t-[#FFD700] p-10 bg-white shadow-2xl">
        <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
          {role === "ADM" ? "Nouvelle question standard" : role === "ENS" ? "Nouvelle question personnelle" : "Nouvelle question"}
        </DialogTitle>
        <div className="space-y-6 py-8 text-slate-900">
          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-slate-500 ml-1">Intitulé de la question</label>
            <Input
              placeholder="Saisir..."
              value={intitule}
              maxLength={MAX_INTITULE}
              onChange={(e) => setIntitule(e.target.value)}
              className={`h-12 border-2 border-slate-100 rounded-2xl font-medium text-sm ${intitule.length >= MAX_INTITULE ? "border-red-300" : ""}`}
            />
            <div className="flex justify-end">
              <span className={`text-xs font-medium ${intitule.length > MAX_INTITULE - 10 ? "text-red-400" : "text-slate-400"}`}>
                {intitule.length}/{MAX_INTITULE}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-slate-500 ml-1">Type qualificatif</label>
            <select
              value={idQualif}
              onChange={(e) => setIdQualif(e.target.value)}
              className="w-full h-12 border-2 border-slate-100 rounded-2xl font-medium text-sm bg-white shadow-sm px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Choisir dans la liste...</option>
              {qualificatifs.map((c: any) => (
                <option key={c.id} value={String(c.id)}>{c.mot2} / {c.mot1}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!isValid}
            className={`w-full h-12 font-semibold rounded-xl text-sm transition-all ${isValid ? "bg-black text-[#FFD700] hover:bg-slate-800 shadow-xl" : "bg-slate-50 text-slate-200 cursor-not-allowed border-none"}`}
            onClick={() => { onAdd(intitule.trim(), idQualif); setOpen(false); setIntitule(""); setIdQualif(""); }}
          >
            {role === "ADM" ? "Ajouter la question standard" : role === "ENS" ? "Ajouter la question personnelle" : "Ajouter la question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}