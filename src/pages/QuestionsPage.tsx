import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

// --- LISTE DES QUALIFICATIFS ---
const LISTE_QUALIFICATIFS = [
  { id: '1', max: 'Fort', min: 'Faible' },
  { id: '2', max: 'Suffisant', min: 'Insuffisant' },
  { id: '3', max: 'Facile', min: 'Difficile' },
  { id: '4', max: 'Riche', min: 'Pauvre' },
  { id: '5', max: 'Rapide', min: 'Lent' },
  { id: '6', max: 'Trop nombreux', min: 'Peu nombreux' },
  { id: '7', max: 'Bonne', min: 'Mauvaise' },
  { id: '8', max: 'Satisfaisant', min: 'Insatisfaisant' },
  { id: '9', max: 'Excessif', min: 'Raisonnable' },
  { id: '10', max: 'Tres clair', min: 'Peu clair' },
  { id: '11', max: 'Efficace', min: 'Inefficace' },
  { id: '12', max: 'Abondant', min: 'Rare' },
  { id: '13', max: 'Simple', min: 'Complexe' },
];

// --- JEU DE DONNÉES INITIAL ---
const LISTE_QUESTIONS_INITIALES = [
  { id: '1', intitule: 'Contenu', idQualificatif: '1' },
  { id: '2', intitule: 'Interet', idQualificatif: '2' },
  { id: '3', intitule: 'Assimilite (Ce cours est-il facile e assimiler ?)', idQualificatif: '8' },
  { id: '4', intitule: 'Support de cours', idQualificatif: '3' },
  { id: '5', intitule: 'Rythme', idQualificatif: '4' },
  { id: '6', intitule: 'Nombre de seances', idQualificatif: '13' },
  { id: '7', intitule: 'Attention, participation des etudiants', idQualificatif: '5' },
  { id: '8', intitule: 'Clarte de lenseignant', idQualificatif: '6' },
  { id: '9', intitule: 'Competence de lenseignant (vis-e-vis) du domaine)', idQualificatif: '7' },
  { id: '10', intitule: 'Utilitte des TD pour assimiler le cours', idQualificatif: '7' },
  { id: '11', intitule: 'Niveau des exercices', idQualificatif: '6' },
  { id: '12', intitule: 'Clarte des enonces', idQualificatif: '6' },
  { id: '13', intitule: 'Utilite des TPpour assimiler le cours', idQualificatif: '10' },
  { id: '14', intitule: 'Explications individuelles', idQualificatif: '9' },
  { id: '15', intitule: 'Difficulte du sujet', idQualificatif: '8' },
  { id: '16', intitule: 'Utilite du projet pour assimiler le cours', idQualificatif: '10' },
  { id: '17', intitule: 'Interet personnel', idQualificatif: '2' },
  { id: '18', intitule: 'Impression generale', idQualificatif: '11' },
  { id: '19', intitule: 'Investissement personnel', idQualificatif: '2' },
  { id: '20', intitule: 'Interet e priori pour cet enseignement', idQualificatif: '2' },
  { id: '21', intitule: 'Interet e posteriori pour cet enseignement', idQualificatif: '2' },
  { id: '22', intitule: 'Volume global horaire', idQualificatif: '12' },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState(LISTE_QUESTIONS_INITIALES);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setQuestions(prev => [...prev].sort((a, b) => a.intitule.localeCompare(b.intitule)));
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => q.intitule.includes(search))
      .sort((a, b) => a.intitule.localeCompare(b.intitule));
  }, [questions, search]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentData = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = (intitule: string, idQualif: string) => {
    const newQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      intitule: intitule,
      idQualificatif: idQualif
    };
    setQuestions(prev => [...prev, newQuestion].sort((a, b) => a.intitule.localeCompare(b.intitule)));
  };

  const handleUpdate = (id: string, updatedIntitule: string, updatedIdQualif: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, intitule: updatedIntitule, idQualificatif: updatedIdQualif } : q)
          .sort((a, b) => a.intitule.localeCompare(b.intitule))
    );
    alert("Mise à jour réussie !");
  };

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    alert("Suppression réussie !");
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-8 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">Questions</h1>
          <div className="h-2 w-24 bg-[#FFD700] rounded-full"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic text-slate-900">UBO Institutional Resources</p>
        </div>
        <AddQuestionDialog onAdd={handleAdd} />
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-12 group">
        <Search className="absolute left-6 top-5 h-6 w-6 text-slate-300 group-focus-within:text-[#FFD700] transition-all" />
        <Input 
          placeholder="Rechercher" 
          className="pl-16 h-16 bg-white border-none shadow-sm rounded-[2rem] focus-visible:ring-2 focus-visible:ring-[#FFD700] font-black text-xs uppercase tracking-widest text-slate-900"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* LISTE DES QUESTIONS : LARGEUR RÉDUITE ICI */}
      <div className="max-w-2xl mx-auto space-y-4 mb-12">
        {currentData.length > 0 ? (
          currentData.map((q) => (
            <QuestionCard key={q.id} question={q} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))
        ) : (
          <div className="flex flex-col items-center py-20 text-slate-200 uppercase font-black tracking-[0.5em] text-xs">
            <Inbox size={64} className="opacity-10 mb-4" />
            <p>Aucun résultat trouvé</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="rounded-xl border-2 h-12 w-12 border-slate-200">
            <ChevronLeft size={20} />
          </Button>
          <span className="font-black text-xs uppercase tracking-widest bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 text-slate-900">
            Page {currentPage} / {totalPages}
          </span>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="rounded-xl border-2 h-12 w-12 border-slate-200">
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}

// --- CARD QUESTION ---
function QuestionCard({ question, onDelete, onUpdate }: any) {
  const qualif = LISTE_QUALIFICATIFS.find(c => c.id === question.idQualificatif);
  const [editIntitule, setEditIntitule] = useState(question.intitule);
  const [editIdQualif, setEditIdQualif] = useState(question.idQualificatif);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="group flex items-center justify-between p-6 bg-white border-l-[12px] border-l-[#FFD700] rounded-2xl shadow-sm hover:shadow-md hover:translate-x-2 transition-all duration-300">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{question.intitule}</h3>
        {qualif && (
          <div className="flex gap-2 mt-1">
            <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter italic">
              {qualif.min} / {qualif.max}
            </span>
          </div>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 border-l pl-4 border-slate-50">
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
              <Edit3 size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[2.5rem] border-t-[20px] border-t-blue-500 bg-white shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Modifier la Question</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 py-8 items-end text-slate-900">
              <div className="flex-1 space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Intitulé</label>
                <Input 
                  value={editIntitule}
                  onChange={(e) => setEditIntitule(e.target.value)}
                  className="h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus-visible:ring-blue-500"
                />
              </div>
              <div className="w-64 space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Qualificatif</label>
                <Select onValueChange={setEditIdQualif} value={editIdQualif}>
                  <SelectTrigger className="h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {LISTE_QUALIFICATIFS.map(c => (
                      <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px] py-3 text-slate-900">
                        {c.min} / {c.max}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-800 transition-all uppercase tracking-widest text-sm"
                onClick={() => {
                  onUpdate(question.id, editIntitule, editIdQualif);
                  setIsEditDialogOpen(false);
                }}
              >
                Mettre à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
              <Trash2 size={18} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] border-t-[15px] border-t-red-500 bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase italic text-slate-900">Confirmation</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-slate-500">
                Êtes-vous sûr de vouloir supprimer cette question ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 mt-4">
              <AlertDialogCancel className="rounded-xl font-black uppercase text-xs border-2">Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(question.id)}
                className="bg-red-500 text-white hover:bg-red-700 rounded-xl font-black uppercase text-xs shadow-lg"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

// --- DIALOG AJOUT ---
function AddQuestionDialog({ onAdd }: any) {
  const [intitule, setIntitule] = useState("");
  const [idQualif, setIdQualif] = useState("");
  const [open, setOpen] = useState(false);
  const isValid = intitule.trim() !== "" && idQualif !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-black rounded-2xl h-14 px-10 shadow-xl transition-all active:scale-95">
          <Plus className="mr-2 h-6 w-6" strokeWidth={4} /> AJOUTER
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-t-[20px] border-t-[#FFD700] bg-white shadow-2xl p-8 text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Nouvelle Question</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 py-8 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Intitulé</label>
            <Input 
              placeholder="SAISIR L'INTITULÉ..." 
              value={intitule}
              onChange={(e) => setIntitule(e.target.value)}
              className="h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus-visible:ring-[#FFD700]"
            />
          </div>
          <div className="w-64 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Qualificatif</label>
            <Select onValueChange={setIdQualif} value={idQualif}>
              <SelectTrigger className="h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] bg-white text-slate-900">
                <SelectValue placeholder="SÉLECTIONNER..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LISTE_QUALIFICATIFS.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px] py-3">
                    {c.min} / {c.max}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            disabled={!isValid} 
            className={`w-full h-14 font-black rounded-2xl transition-all uppercase tracking-widest text-sm ${
              isValid ? "bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black shadow-lg" : "bg-slate-100 text-slate-300 cursor-not-allowed border-none"
            }`}
            onClick={() => {
              onAdd(intitule, idQualif);
              setOpen(false);
              setIntitule("");
              setIdQualif("");
            }}
          >
            {isValid ? "Valider l'Ajout" : "Remplir tous les champs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}