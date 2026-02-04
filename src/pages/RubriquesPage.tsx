import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, GripVertical, Trash2, Edit3, HelpCircle, Inbox } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- COMPOSANT ITEM (ALIGNEMENT VERTICAL PARFAIT) ---
const SortableItem = ({ id, titre, hasQuestions, onDelete, onEdit }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [editValue, setEditValue] = useState(titre);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`group relative flex items-center p-0 mb-4 bg-white border-l-[12px] border-l-[#FFD700] rounded-2xl shadow-sm hover:shadow-md hover:translate-x-2 transition-all duration-300 min-h-[100px] ${isDragging ? "shadow-2xl ring-2 ring-[#FFD700]" : ""}`}
    >
      {/* 1. L'ICÔNE DE DRAG : Centrage mathématique absolu */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-6 top-1/2 -translate-y-1/2 cursor-grab text-slate-300 hover:text-[#FFD700] transition-colors p-1"
      >
        <GripVertical size={28} />
      </div>

      {/* 2. LE CONTENU TEXTUEL : Décalé pour laisser la place à l'icône */}
      <div className="flex flex-col ml-20 py-4">
        <div className="flex items-center gap-3">
          <span className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none">
            {titre}
          </span>
          {hasQuestions && (
            <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              Actif
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-80">
          Ressource Standard
        </span>
      </div>

      {/* 3. LES ACTIONS : Alignées à droite et centrées verticalement */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 border-l pl-4 border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <Edit3 size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-t-[15px] border-t-[#FFD700] bg-white shadow-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-slate-900">Mise à jour</DialogTitle></DialogHeader>
            <div className="py-6">
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-12 border-slate-200 rounded-xl font-bold uppercase focus-visible:ring-[#FFD700]" />
            </div>
            <DialogFooter>
              <Button className="w-full h-12 bg-[#FFD700] text-black font-black rounded-xl hover:bg-black hover:text-white transition-all" onClick={() => { onEdit(id, editValue); setIsEditOpen(false); }}>
                METTRE À JOUR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={hasQuestions} 
                  onClick={() => onDelete(id)}
                  className={`h-10 w-10 rounded-xl transition-all ${hasQuestions ? "opacity-20 text-slate-300" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}
                >
                  <Trash2 size={18} />
                </Button>
              </span>
            </TooltipTrigger>
            {hasQuestions && (
              <TooltipContent className="bg-red-600 text-white font-black text-[9px] uppercase border-none shadow-xl">
                <p>Suppression bloquée : Contient des questions</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

// --- PAGE PRINCIPALE ---
export default function RubriquesPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [rubriques, setRubriques] = useState([
    { id: '1', titre: "COURS", hasQuestions: true },
    { id: '2', titre: "TD", hasQuestions: false },
    { id: '3', titre: "TP", hasQuestions: true },
    { id: '4', titre: "Projet", hasQuestions: false },
    { id: '5', titre: "Bilan", hasQuestions: true },
    { id: '6', titre: "COURS/TP AGL: DBA-API-PROCESSUS", hasQuestions: true },
    { id: '7', titre: "TP AGL:DBA-API-PROCESSUS", hasQuestions: false },
    { id: '8', titre: "Examen", hasQuestions: true },
    { id: '9', titre: "Devoir Surveillé", hasQuestions: false },
    { id: '10', titre: "Travail Pratique", hasQuestions: true },
    { id: '11', titre: "COURS/TD : ANALYSE-CONCEPTION", hasQuestions: true },
    { id: '12', titre: "TP :ANALYSE-CONCEPTION", hasQuestions: false },
    { id: '13', titre: "Quiz", hasQuestions: true },
    { id: '14', titre: "Exposé:", hasQuestions: false },
    { id: '15', titre: "Contrôle Continu", hasQuestions: true },
    { id: '16', titre: "COURS/TD : BASE DE DONNEES", hasQuestions: true },
    { id: '17', titre: "TP: BASE DE DONNEES", hasQuestions: false },
    { id: '18', titre: "Exercice", hasQuestions: true },
    { id: '19', titre: "Présentation", hasQuestions: false },
    { id: '20', titre: "Devoir à la maison", hasQuestions: true },
    { id: '21', titre: "COURS/TD: BI", hasQuestions: true },
    { id: '22', titre: "TP: BI", hasQuestions: false },
    { id: '23', titre: "Devoir Noté", hasQuestions: true },
    { id: '24', titre: "Examen Blanc", hasQuestions: false },
    { id: '25', titre: "Travail de Groupe", hasQuestions: true },
    { id: '26', titre: "COURS/TD : ADMINISTRATION-RESEAU", hasQuestions: true },
    { id: '27', titre: "TP: ADMINISTRATION-RESEAU", hasQuestions: false },
    { id: '28', titre: "Exercice Pratique", hasQuestions: true },
    { id: '29', titre: "Préparation de l'examen", hasQuestions: false },
    { id: '30', titre: "Séance de Révision", hasQuestions: true },
    { id: '31', titre: "COURS/TD: ERP", hasQuestions: true },
    { id: '32', titre: "Evaluation finale", hasQuestions: false },
    { id: '33', titre: "Soutenance de projet", hasQuestions: true },
    { id: '34', titre: "Participation en classe", hasQuestions: false },
    { id: '35', titre: "Examen oral", hasQuestions: true },
    { id: '36', titre: "Memoire", hasQuestions: false },
    { id: '37', titre: "Présentation orale", hasQuestions: true },
  ]);

  useEffect(() => {
    setRubriques(prev => [...prev].sort((a, b) => a.titre.localeCompare(b.titre)));
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const filteredItems = useMemo(() => 
    rubriques.filter(item => item.titre.toLowerCase().includes(search.toLowerCase())),
  [rubriques, search]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newEntry = { id: Math.random().toString(36).substr(2, 9), titre: newTitle.toUpperCase(), hasQuestions: false };
    setRubriques(prev => [...prev, newEntry].sort((a, b) => a.titre.localeCompare(b.titre)));
    setNewTitle("");
    setIsAddOpen(false);
  };

  const handleEdit = (id: string, newTitre: string) => {
    setRubriques(prev => prev.map(item => item.id === id ? { ...item, titre: newTitre.toUpperCase() } : item));
  };

  const handleDelete = (id: string) => setRubriques(prev => prev.filter(item => item.id !== id));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRubriques((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-8 bg-slate-50/50 min-h-screen font-sans selection:bg-[#FFD700] selection:text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-16">
        <div className="relative">
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">Rubriques</h1>
          <div className="h-2 w-24 bg-[#FFD700] rounded-full"></div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-3 italic">UBO Institutional Resources</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="group bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-black rounded-2xl h-14 px-10 transition-all duration-300 shadow-xl active:scale-95">
              <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={4} /> AJOUTER
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-t-[20px] border-t-[#FFD700] bg-white shadow-2xl">
            <DialogHeader><DialogTitle className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">Nouvel Élément</DialogTitle></DialogHeader>
            <div className="py-8">
              <Input placeholder="NOM DE LA RESSOURCE" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-14 border-2 border-slate-100 rounded-2xl font-black uppercase text-sm focus-visible:ring-offset-0 focus-visible:ring-[#FFD700]" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            </div>
            <DialogFooter><Button onClick={handleAdd} className="w-full h-14 bg-black text-[#FFD700] font-black rounded-2xl hover:bg-[#FFD700] hover:text-black transition-all uppercase tracking-widest">Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH (LARGEUR COMPLÈTE) */}
      <div className="relative mb-12 group">
        <Search className="absolute left-6 top-5 h-6 w-6 text-slate-300 group-focus-within:text-[#FFD700] group-focus-within:scale-110 transition-all duration-300" />
        <Input placeholder="FILTRER PAR NOM DE RUBRIQUE..." className="pl-16 h-16 bg-white border-none shadow-sm rounded-[2rem] focus-visible:ring-2 focus-visible:ring-[#FFD700] uppercase text-xs font-black tracking-widest transition-all placeholder:text-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* LISTE (LARGEUR RACCCOURCIE) */}
      <div className="max-w-2xl mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems} strategy={verticalListSortingStrategy}>
            <div className="pb-20">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <SortableItem key={item.id} id={item.id} titre={item.titre} hasQuestions={item.hasQuestions} onDelete={handleDelete} onEdit={handleEdit} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <Inbox size={64} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-sm opacity-50">Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}