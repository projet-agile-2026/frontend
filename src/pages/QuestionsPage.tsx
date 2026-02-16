import  React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { getQualificatifs, type QualificatifDTO } from "../services/Qualificatifservice";
import { getCurrentUser, type UserInfo } from "@/services/authService"



export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [qualificatifs, setQualificatifs] = useState<QualificatifDTO[]>([]);
  const itemsPerPage = 8;

  const [user, setUser] = useState<UserInfo | null>(null)


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
    } catch (err) {
      console.error("Erreur Oracle", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => q.intitule.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.intitule.localeCompare(b.intitule));
  }, [questions, search]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentData = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = async (intitule: string, idQualif: string) => {
    try {
      const newQ = await createQuestion({
        intitule,
        idQualificatif: Number(idQualif)
      });

      setQuestions(prev => [...prev, newQ].sort((a, b) => a.intitule.localeCompare(b.intitule)));
    } catch (err) { alert("Erreur lors de l'ajout"); }
  };

  const handleUpdate = async (id: any, updatedIntitule: string, updatedIdQualif: string, question: Question) => {
    try {
      const updated = await updateQuestion(id, {
        intitule: updatedIntitule,
        idQualificatif: Number(updatedIdQualif),
        type: question.type,
        noEnseignant: question.noEnseignant
      });

      setQuestions(prev => prev.map(q => q.idQuestion === id ? updated : q));
    } catch (err) { alert("Erreur lors de la modification"); }
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.idQuestion !== id));
    } catch (err: any) { alert(err.message); }
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
          <h1 className="text-3xl font-bold tracking-tight uppercase italic">Questions</h1>
          <AddQuestionDialog onAdd={handleAdd}  qualificatifs={qualificatifs}/>
        </div>

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
          <div className="grid grid-cols-12 bg-slate-50 border-b py-4 px-8 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-7 italic">Questions</div>
            <div className="col-span-1 text-center italic">Type</div>
            <div className="col-span-3 text-center italic">Couple Qualificatif</div>
            <div className="col-span-1 text-right italic">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {currentData.length > 0 ? (
              currentData.map((q) => (
                <QuestionRow 
                  key={q.idQuestion} 
                  question={q} 
                  qualificatifs={qualificatifs}
                  onDelete={handleDelete} 
                  onUpdate={handleUpdate} 
                  role={user?.role} 
                />
              ))
            ) : (
              <div className="py-20 text-center text-slate-300 font-medium uppercase text-xs tracking-widest">
                Aucun enregistrement en base Oracle
              </div>
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-60">
              {filteredQuestions.length} entrée(s) trouvée(s)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="h-10 rounded-xl font-bold text-xs uppercase border-slate-200 shadow-sm hover:bg-black hover:text-[#FFD700] transition-colors">
                <ChevronLeft className="h-4 w-4 mr-2" /> Précédent
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="h-10 rounded-xl font-bold text-xs uppercase border-slate-200 shadow-sm hover:bg-black hover:text-[#FFD700] transition-colors">
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
function QuestionRow({ question, onDelete,qualificatifs, onUpdate, role }: any) {
  const qualif = qualificatifs.find((c: any) => Number(c.id) === Number(question.idQualificatif));
  const [editIntitule, setEditIntitule] = useState(question.intitule);
  const [editIdQualif, setEditIdQualif] = useState(String(question.idQualificatif));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isUsed = question.usedInRubrique;
  const isPersonal = question.type === "QUP"
  const isStandard = question.type === "QUS"
  const isAdmin = role === "ADM"
  const isTeacher = role === "ENS"
  console.log("Hayhayhay", question)

  const canEdit =
    !isUsed && (
      (isAdmin && isStandard) ||
      (isTeacher && isPersonal)
    )

  const canDelete =
    !isUsed && (
      (isAdmin && isStandard) ||
      (isTeacher && isPersonal)
    )

  return (
    <div className="grid grid-cols-12 items-center py-5 px-8 hover:bg-slate-50 transition-colors bg-white border-l-4 border-l-transparent hover:border-l-[#FFD700]">
      <div className="col-span-7">
        <span className="text-sm font-bold text-slate-800 leading-tight uppercase">
          {question.intitule}
        </span>
      </div>

      <div className="col-span-1 flex justify-center">
        <span
          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider
            ${isPersonal
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-600 border border-gray-300"}
          `}
        >
          {isPersonal ? "PERSONNELLE" : "STANDARD"}
        </span>
      </div>

      <div className="col-span-3 flex justify-center">
        {qualif && (
          <div className="inline-flex items-center gap-3">
            {/* POLICE DES COUPLES AGRANDIE ICI : text-[11px] */}
            <span className="text-[11px] font-bold text-slate-400 uppercase italic tracking-wider">
              {qualif.mot2}
            </span>
            <div className="h-1 w-3 bg-slate-200 rounded-full"></div>
            <span className="text-[11px] font-bold text-slate-900 uppercase italic tracking-wider">
              {qualif.mot1}
            </span>
          </div>
        )}
      </div>

      <div className="col-span-1 flex justify-end gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" disabled={!canEdit} size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 shadow-sm"><Edit3 size={14} /></Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-t-[10px] border-t-blue-500 p-10 bg-white">
            <DialogHeader><DialogTitle className="text-xl font-bold uppercase italic tracking-tighter">Modifier la question</DialogTitle></DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2 text-left text-slate-900">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 italic tracking-widest">Désignation</label>
                <Input value={editIntitule} onChange={(e) => setEditIntitule(e.target.value)} className="h-12 border-2 rounded-xl font-bold text-sm uppercase" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 italic tracking-widest">Type Qualificatif</label>
                <Select onValueChange={setEditIdQualif} value={editIdQualif}>
                  <SelectTrigger className="h-12 border-2 rounded-xl font-bold text-xs uppercase text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {qualificatifs.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)} className="text-xs font-bold uppercase">
                        {c.mot2} / {c.mot1}
                      </SelectItem>
                    ))}

                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg" onClick={() => { onUpdate(question.idQuestion, editIntitule, editIdQualif, question); setIsEditDialogOpen(false); }}>Mise à jour</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={!canDelete}
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg border border-slate-100 shadow-sm
                ${isUsed 
                  ? "text-slate-200 cursor-not-allowed"
                  : "text-slate-400 hover:text-red-600"}
              `}
              title={isStandard ? "Question standard non modifiable" : isUsed ? "Question utilisée dans une rubrique": "Supprimer"}
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border-t-[10px] border-t-red-500 p-10 bg-white shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold uppercase italic tracking-tighter">Confirmation</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-slate-500 text-sm italic">Supprimer définitivement cet enregistrement de la base Oracle ?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-3">
              <AlertDialogCancel className="rounded-xl font-bold uppercase text-[9px] h-11 border-2">Annuler</AlertDialogCancel>
              <AlertDialogAction disabled={isUsed} onClick={() => !isUsed && onDelete(question.idQuestion)} className="bg-red-500 text-white hover:bg-red-700 rounded-xl font-bold uppercase text-[9px] h-11 shadow-lg px-8 transition-colors">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function AddQuestionDialog({ onAdd, qualificatifs }: any) {
  const [intitule, setIntitule] = useState("");
  const [idQualif, setIdQualif] = useState("");
  const [open, setOpen] = useState(false);
  const isValid = intitule.trim() !== "" && idQualif !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-[#FFD700] hover:bg-slate-800 font-bold rounded-xl h-11 px-6 shadow-sm text-xs uppercase tracking-widest italic transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Nouveau
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl border-t-[10px] border-t-[#FFD700] p-10 bg-white shadow-2xl">
        <DialogHeader><DialogTitle className="text-2xl font-bold uppercase italic tracking-tighter text-slate-900">Nouvelle question</DialogTitle></DialogHeader>
        <div className="space-y-6 py-8 text-slate-900">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 italic tracking-widest">Intitulé de la question</label>
            <Input placeholder="Saisir..." value={intitule} onChange={(e) => setIntitule(e.target.value)} className="h-12 border-2 border-slate-100 rounded-2xl font-bold text-sm uppercase" />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 italic tracking-widest">Type Qualificatif</label>
            <Select onValueChange={setIdQualif} value={idQualif}>
              <SelectTrigger className="h-12 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase bg-white shadow-sm"><SelectValue placeholder="Choisir dans la liste..." /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {qualificatifs.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)} className="text-xs font-bold uppercase">
                    {c.mot2} / {c.mot1}
                  </SelectItem>
                ))}

              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!isValid} className={`w-full h-12 font-bold rounded-xl uppercase tracking-widest text-xs transition-all ${isValid ? "bg-black text-[#FFD700] hover:bg-slate-800 shadow-xl" : "bg-slate-50 text-slate-200 cursor-not-allowed border-none"}`} onClick={() => { onAdd(intitule, idQualif); setOpen(false); setIntitule(""); setIdQualif(""); }}>Valider l'insertion</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}