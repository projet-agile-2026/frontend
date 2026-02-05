import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { questionService } from '../services/questionService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";

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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Chargement des données depuis l'API Oracle
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await questionService.getAll();
      setQuestions(data.sort((a, b) => a.intitule.localeCompare(b.intitule)));
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => q.intitule.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.intitule.localeCompare(b.intitule));
  }, [questions, search]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentData = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = async (intitule, idQualif) => {
    try {
      // On envoie le format attendu par l'entité Question (TYPE par défaut 'QUS')
      const newQ = await questionService.create({ 
        intitule, 
        idQualificatif: idQualif,
        type: 'QUS',
        noEnseignant: null
      });
      setQuestions(prev => [...prev, newQ].sort((a, b) => a.intitule.localeCompare(b.intitule)));
    } catch (err) { alert(err.message); }
  };

  const handleUpdate = async (id, updatedIntitule, updatedIdQualif) => {
    try {
      const updated = await questionService.update(id, { 
        idQuestion: id,
        intitule: updatedIntitule, 
        idQualificatif: updatedIdQualif,
        type: 'QUS',
        noEnseignant: null
      });
      setQuestions(prev => prev.map(q => q.idQuestion === id ? updated : q));
    } catch (err) { alert("Erreur lors de la modification"); }
  };

  const handleDelete = async (id) => {
    try {
      await questionService.delete(id);
      setQuestions(prev => prev.filter(q => q.idQuestion !== id));
    } catch (err) {
      alert(err.message); // Affiche l'erreur de contrainte d'intégrité ORA-02292
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-[#FFD700] mb-4" />
      <p className="font-black uppercase tracking-widest text-xs">Chargement UBO Resources...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-8 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">Questions</h1>
          <div className="h-2 w-24 bg-[#FFD700] rounded-full"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">UBO Institutional Resources</p>
        </div>
        <AddQuestionDialog onAdd={handleAdd} />
      </div>

      <div className="relative mb-12 group">
        <Search className="absolute left-6 top-5 h-6 w-6 text-slate-300 group-focus-within:text-[#FFD700] transition-all" />
        <Input 
          placeholder="Rechercher une question..." 
          className="pl-16 h-16 bg-white border-none shadow-sm rounded-[2rem] focus-visible:ring-2 focus-visible:ring-[#FFD700] font-black text-xs uppercase tracking-widest text-slate-900"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-4 mb-12">
        {currentData.length > 0 ? (
          currentData.map((q) => (
            <QuestionCard key={q.idQuestion} question={q} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))
        ) : (
          <div className="flex flex-col items-center py-20 text-slate-200 uppercase font-black tracking-[0.5em] text-xs">
            <Inbox size={64} className="opacity-10 mb-4" />
            <p>Aucun résultat en base</p>
          </div>
        )}
      </div>

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

function QuestionCard({ question, onDelete, onUpdate }) {
  const qualif = LISTE_QUALIFICATIFS.find(c => c.id === String(question.idQualificatif));
  const [editIntitule, setEditIntitule] = useState(question.intitule);
  const [editIdQualif, setEditIdQualif] = useState(String(question.idQualificatif));
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
          <DialogContent className="max-w-2xl rounded-[2.5rem] border-t-[20px] border-t-blue-500 bg-white p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Modifier</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 py-8 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intitulé</label>
                <Input value={editIntitule} onChange={(e) => setEditIntitule(e.target.value)} className="h-14 border-2 rounded-2xl font-black uppercase text-xs" />
              </div>
              <div className="w-64 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qualificatif</label>
                <Select onValueChange={setEditIdQualif} value={editIdQualif}>
                  <SelectTrigger className="h-14 border-2 rounded-2xl font-black uppercase text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTE_QUALIFICATIFS.map(c => <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px]">{c.min} / {c.max}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl uppercase" onClick={() => { onUpdate(question.idQuestion, editIntitule, editIdQualif); setIsEditDialogOpen(false); }}>Mettre à jour</Button>
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
              <AlertDialogTitle className="text-xl font-black uppercase italic">Attention</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-slate-500">Confirmer la suppression de cette question de la base Oracle ?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-black uppercase text-xs">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(question.idQuestion)} className="bg-red-500 text-white hover:bg-red-700 rounded-xl font-black uppercase text-xs">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

function AddQuestionDialog({ onAdd }) {
  const [intitule, setIntitule] = useState("");
  const [idQualif, setIdQualif] = useState("");
  const [open, setOpen] = useState(false);
  const isValid = intitule.trim() !== "" && idQualif !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-black rounded-2xl h-14 px-10 shadow-xl transition-all">
          <Plus className="mr-2 h-6 w-6" strokeWidth={4} /> AJOUTER
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-t-[20px] border-t-[#FFD700] bg-white p-8">
        <DialogHeader><DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Nouvelle Question</DialogTitle></DialogHeader>
        <div className="flex gap-4 py-8 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intitulé</label>
            <Input placeholder="SAISIR..." value={intitule} onChange={(e) => setIntitule(e.target.value)} className="h-14 border-2 rounded-2xl font-black uppercase text-xs" />
          </div>
          <div className="w-64 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qualificatif</label>
            <Select onValueChange={setIdQualif} value={idQualif}>
              <SelectTrigger className="h-14 border-2 rounded-2xl font-black uppercase text-[10px]"><SelectValue placeholder="SÉLECTIONNER..." /></SelectTrigger>
              <SelectContent>
                {LISTE_QUALIFICATIFS.map(c => <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px]">{c.min} / {c.max}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!isValid} className={`w-full h-14 font-black rounded-2xl uppercase ${isValid ? "bg-black text-[#FFD700] hover:bg-[#FFD700]" : "bg-slate-100 text-slate-300"}`} onClick={() => { onAdd(intitule, idQualif); setOpen(false); setIntitule(""); setIdQualif(""); }}>Valider l'Ajout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}