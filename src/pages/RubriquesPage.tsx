import  React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, GripVertical, Trash2, Edit2, ChevronDown, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
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
import { DragEndEvent } from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import services
import { rubriqueService } from '../services/Rubriqueservice';
import { questionService } from '../services/Questionservice';
import { qualificatifService } from '../services/Qualificatifservice';

// TYPES & INTERFACES
interface Qualificatif {
  id: number;
  mot1: string;
  mot2: string;
}

interface Question {
  idQuestion: number;
  intitule: string;
  idQualificatif: number;
  ordre: number;
  type?: string;
  maximal?: string;
  minimal?: string;
}

interface AvailableQuestion {
  idQuestion: number;
  intitule: string;
  idQualificatif: string;
  type: string;
  noEnseignant: string | null;
}

interface Rubrique {
  idRubrique: number;
  designation: string;
  type: string;
  ordre: number;
  questions: Question[];
  isExpanded: boolean;
}

// SORTABLE QUESTION ROW
interface SortableQuestionRowProps {
  question: Question;
  rubriqueId: number;
  qualificatifs: Qualificatif[];
  onDelete: (rubriqueId: number, questionId: number) => void;
}

const SortableQuestionRow = ({ question, rubriqueId, qualificatifs, onDelete }: SortableQuestionRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.idQuestion.toString()
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#fef3c7' : 'transparent'
  };

  const qualificatif = qualificatifs.find((q) => q.id === question.idQualificatif);
  const qualificatifLabel = qualificatif ? `${qualificatif.mot1} ↔ ${qualificatif.mot2}` : 'Non défini';

  const handleDelete = () => {
    onDelete(rubriqueId, question.idQuestion);
    setShowDeleteConfirm(false);
  };

  return (
      <>
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-2 py-2.5 px-3 bg-yellow-50 border-b border-yellow-100 hover:bg-yellow-100 transition-colors"
        >
          <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <GripVertical size={16} />
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 items-center min-w-0">
            <div className="col-span-6 text-sm text-gray-900 truncate">{question.intitule}</div>
            <div className="col-span-5 text-sm text-gray-600 truncate">{qualificatifLabel}</div>
            <div className="col-span-1 flex justify-end gap-2 flex-shrink-0">
              <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                  title="Retirer de la rubrique"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Retirer la question
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir retirer <strong>"{question.intitule}"</strong> de cette rubrique ? La question ne sera pas supprimée, seulement retirée de cette rubrique.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Retirer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
  );
};

// SORTABLE RUBRIQUE ROW
interface SortableRubriqueRowProps {
  rubrique: Rubrique;
  qualificatifs: Qualificatif[];
  availableQuestions: AvailableQuestion[];
  onToggleExpand: (id: number) => void;
  onDeleteRubrique: (id: number) => void;
  onEditRubrique: (id: number, newDesignation: string) => void;
  onAddQuestion: (rubriqueId: number, selectedQuestionId: number) => void;
  onDeleteQuestion: (rubriqueId: number, questionId: number) => void;
  onDragQuestionEnd: (rubriqueId: number, event: DragEndEvent) => void;
}

const SortableRubriqueRow = ({
                               rubrique,
                               qualificatifs,
                               availableQuestions,
                               onToggleExpand,
                               onDeleteRubrique,
                               onEditRubrique,
                               onAddQuestion,
                               onDeleteQuestion,
                               onDragQuestionEnd
                             }: SortableRubriqueRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rubrique.idRubrique.toString()
  });

  const [editValue, setEditValue] = useState(rubrique.designation);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const questionSensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Filter available questions (exclude already added)
  const currentQuestionIds = rubrique.questions.map(q => q.idQuestion);
  const filteredAvailableQuestions = availableQuestions
      .filter(q => !currentQuestionIds.includes(q.idQuestion))
      .filter(q => q.intitule.toLowerCase().includes(questionSearch.toLowerCase()));

  const handleAddQuestion = () => {
    if (!selectedQuestionId) return;
    onAddQuestion(rubrique.idRubrique, parseInt(selectedQuestionId));
    setSelectedQuestionId("");
    setQuestionSearch("");
    setIsAddQuestionOpen(false);
  };

  const handleDelete = () => {
    onDeleteRubrique(rubrique.idRubrique);
    setShowDeleteConfirm(false);
  };

  const canDelete = rubrique.questions.length === 0;

  return (
      <>
        <div ref={setNodeRef} style={style} className={`border-l-4 border-l-yellow-400 bg-white mb-2 overflow-hidden ${isDragging ? 'shadow-lg' : ''}`}>
          {/* Rubrique Header */}
          <div className="group flex items-center gap-2 py-3 px-3 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <GripVertical size={18} />
            </div>

            <button
                onClick={() => onToggleExpand(rubrique.idRubrique)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              {rubrique.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-bold text-gray-900 truncate">{rubrique.designation}</span>
              {rubrique.questions.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                {rubrique.questions.length}
              </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                <DialogTrigger asChild>
                  <button
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      title="Ajouter une question existante"
                  >
                    <Plus size={16} />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Sélectionner une question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Rechercher</label>
                      <Input
                          placeholder="Rechercher une question..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Questions disponibles</label>
                      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredAvailableQuestions.length > 0 ? (
                            filteredAvailableQuestions.map((q) => {
                              const qual = qualificatifs.find(qf => qf.id === parseInt(q.idQualificatif));
                              return (
                                  <div
                                      key={q.idQuestion}
                                      onClick={() => setSelectedQuestionId(q.idQuestion.toString())}
                                      className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                                          selectedQuestionId === q.idQuestion.toString() ? 'bg-blue-100 border-blue-300' : ''
                                      }`}
                                  >
                                    <div className="font-medium text-sm text-gray-900">{q.intitule}</div>
                                    {qual && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {qual.mot1} ↔ {qual.mot2}
                                        </div>
                                    )}
                                  </div>
                              );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                              {questionSearch ? 'Aucune question trouvée' : 'Toutes les questions sont déjà ajoutées'}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                        onClick={handleAddQuestion}
                        disabled={!selectedQuestionId}
                        className="w-full"
                    >
                      Ajouter à la rubrique
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <button
                      className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-all"
                      title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifier la Rubrique</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Désignation</label>
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                        onClick={() => {
                          onEditRubrique(rubrique.idRubrique, editValue);
                          setIsEditOpen(false);
                        }}
                        className="w-full"
                    >
                      Mettre à jour
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button
                  disabled={!canDelete}
                  onClick={() => canDelete && setShowDeleteConfirm(true)}
                  className={`p-1.5 rounded transition-all ${
                      !canDelete
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={!canDelete ? "Suppression bloquée : Contient des questions" : "Supprimer"}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Questions List */}
          {rubrique.isExpanded && (
              <div className="bg-white">
                {rubrique.questions.length > 0 ? (
                    <>
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-9 py-2 bg-gray-100 border-t border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                        <div className="col-span-6">Question</div>
                        <div className="col-span-5">Échelle</div>
                        <div className="col-span-1 text-right">Actions</div>
                      </div>
                      {/* Questions with DnD */}
                      <DndContext
                          sensors={questionSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => onDragQuestionEnd(rubrique.idRubrique, event)}
                      >
                        <SortableContext items={rubrique.questions.map(q => q.idQuestion.toString())} strategy={verticalListSortingStrategy}>
                          {rubrique.questions.map((question) => (
                              <SortableQuestionRow
                                  key={question.idQuestion}
                                  question={question}
                                  rubriqueId={rubrique.idRubrique}
                                  qualificatifs={qualificatifs}
                                  onDelete={onDeleteQuestion}
                              />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </>
                ) : (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      Aucune question
                    </div>
                )}
              </div>
          )}
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la rubrique <strong>"{rubrique.designation}"</strong> ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
  );
};

// MAIN PAGE
export default function RubriquesPage() {
  const [search, setSearch] = useState("");
  const [isAddRubriqueOpen, setIsAddRubriqueOpen] = useState(false);
  const [newRubriqueTitle, setNewRubriqueTitle] = useState("");
  const [rubriques, setRubriques] = useState<Rubrique[]>([]);
  const [qualificatifs, setQualificatifs] = useState<Qualificatif[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [qualificatifsData, rubriquesData, questionsData] = await Promise.all([
        qualificatifService.getAllQualificatifs(),
        rubriqueService.getAllRubriques(),
        questionService.getAll()
      ]);
      console.log('=== DEBUG DATA ===');
      console.log('Qualificatifs:', qualificatifsData);
      console.log('Rubriques:', rubriquesData);
      console.log('First rubrique questions:', rubriquesData[0]?.questions);

      setQualificatifs(qualificatifsData);
      setAvailableQuestions(questionsData);

      const transformedRubriques = rubriquesData.map((r: any) => ({
        idRubrique: r.idRubrique,
        designation: r.designation,
        type: r.type,
        ordre: r.ordre,
        questions: r.questions || [],
        isExpanded: false
      }));

      console.log('Transformed rubriques:', transformedRubriques);
      console.log('First transformed rubrique questions:', transformedRubriques[0]?.questions);

      setRubriques(transformedRubriques);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredRubriques = useMemo(
      () => rubriques.filter(r => r.designation.toLowerCase().includes(search.toLowerCase())),
      [rubriques, search]
  );

  const handleAddRubrique = async () => {
    if (!newRubriqueTitle.trim()) return;

    try {
      const newRubrique = await rubriqueService.createRubrique({
        designation: newRubriqueTitle.toUpperCase()
      });

      setRubriques(prev => [...prev, { ...newRubrique, questions: [], isExpanded: false }]);
      setNewRubriqueTitle("");
      setIsAddRubriqueOpen(false);
    } catch (err: any) {
      console.error('Error creating rubrique:', err);
      alert('Erreur lors de la création de la rubrique');
    }
  };

  const handleEditRubrique = async (id: number, newDesignation: string) => {
    try {
      const rubrique = rubriques.find(r => r.idRubrique === id);
      if (!rubrique) return;

      await rubriqueService.updateRubrique(id, {
        designation: newDesignation.toUpperCase(),
        type: rubrique.type,
        ordre: rubrique.ordre
      });

      setRubriques(prev => prev.map(r =>
          r.idRubrique === id ? { ...r, designation: newDesignation.toUpperCase() } : r
      ));
    } catch (err: any) {
      console.error('Error updating rubrique:', err);
      alert('Erreur lors de la mise à jour de la rubrique');
    }
  };

  const handleDeleteRubrique = async (id: number) => {
    try {
      await rubriqueService.deleteRubrique(id);
      setRubriques(prev => prev.filter(r => r.idRubrique !== id));
    } catch (err: any) {
      console.error('Error deleting rubrique:', err);
      alert('Erreur lors de la suppression de la rubrique');
    }
  };

  const handleToggleExpand = (id: number) => {
    setRubriques(prev => prev.map(r =>
        r.idRubrique === id ? { ...r, isExpanded: !r.isExpanded } : r
    ));
  };

  const handleDragRubriqueEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // 1. Mise à jour optimiste de l'UI
      const oldIndex = rubriques.findIndex((i) => i.idRubrique.toString() === active.id);
      const newIndex = rubriques.findIndex((i) => i.idRubrique.toString() === over.id);
      const reorderedRubriques = arrayMove(rubriques, oldIndex, newIndex);

      setRubriques(reorderedRubriques);

      // 2. Envoyer au backend
      try {
        const rubriqueOrders = reorderedRubriques.map((r, index) => ({
          idRubrique: r.idRubrique,
          ordre: index + 1
        }));

        // Supposant que toutes les rubriques sont de type "RBS"
        await rubriqueService.reorderRubriques("RBS", rubriqueOrders);
      } catch (err: any) {
        console.error('Error reordering rubriques:', err);
        await loadData(); // Recharger si erreur
      }
    }
  };

  const handleAddQuestion = async (rubriqueId: number, selectedQuestionId: number) => {
    try {
      const rubrique = rubriques.find(r => r.idRubrique === rubriqueId);
      const ordre = (rubrique?.questions.length || 0) + 1;

      await rubriqueService.addQuestionToRubrique(rubriqueId, selectedQuestionId, ordre);
      await loadData();
    } catch (err: any) {
      console.error('Error adding question:', err);
      alert('Erreur lors de l\'ajout de la question');
    }
  };

  const handleDeleteQuestion = async (rubriqueId: number, questionId: number) => {
    try {
      await rubriqueService.removeQuestionFromRubrique(rubriqueId, questionId);

      setRubriques(prev => prev.map(r =>
          r.idRubrique === rubriqueId
              ? { ...r, questions: r.questions.filter(q => q.idQuestion !== questionId) }
              : r
      ));
    } catch (err: any) {
      console.error('Error deleting question:', err);
      alert('Erreur lors de la suppression de la question');
    }
  };

  const handleDragQuestionEnd = async (rubriqueId: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const rubrique = rubriques.find(r => r.idRubrique === rubriqueId);
      if (!rubrique) return;

      const oldIndex = rubrique.questions.findIndex((q) => q.idQuestion.toString() === active.id);
      const newIndex = rubrique.questions.findIndex((q) => q.idQuestion.toString() === over.id);
      const reorderedQuestions = arrayMove(rubrique.questions, oldIndex, newIndex);

      setRubriques(prev => prev.map(r =>
          r.idRubrique === rubriqueId ? { ...r, questions: reorderedQuestions } : r
      ));

      try {
        const questionOrders = reorderedQuestions.map((q, index) => ({
          idQuestion: q.idQuestion,
          ordre: index + 1
        }));

        await rubriqueService.reorderQuestionsInRubrique(rubriqueId, questionOrders);
      } catch (err: any) {
        console.error('Error reordering questions:', err);
        await loadData();
      }
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData}>Réessayer</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">RUBRIQUES & QUESTIONS</h1>

          {/* Search and Add Button */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Filtrer par nom de rubrique..."
                    className="pl-9 h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Dialog open={isAddRubriqueOpen} onOpenChange={setIsAddRubriqueOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-gray-800 h-10">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une rubrique
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle Rubrique</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Désignation</label>
                    <Input
                        placeholder="Nom de la rubrique"
                        value={newRubriqueTitle}
                        onChange={(e) => setNewRubriqueTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRubrique()}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddRubrique} className="w-full">
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Rubriques List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm">
              Rubriques <span className="text-gray-400 font-normal">({filteredRubriques.length} résultat{filteredRubriques.length > 1 ? 's' : ''})</span>
            </h2>
          </div>

          <div className="p-3">
            {filteredRubriques.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragRubriqueEnd}>
                  <SortableContext items={filteredRubriques.map(r => r.idRubrique.toString())} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {filteredRubriques.map((rubrique) => (
                          <SortableRubriqueRow
                              key={rubrique.idRubrique}
                              rubrique={rubrique}
                              qualificatifs={qualificatifs}
                              availableQuestions={availableQuestions}
                              onToggleExpand={handleToggleExpand}
                              onDeleteRubrique={handleDeleteRubrique}
                              onEditRubrique={handleEditRubrique}
                              onAddQuestion={handleAddQuestion}
                              onDeleteQuestion={handleDeleteQuestion}
                              onDragQuestionEnd={handleDragQuestionEnd}
                          />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
            ) : (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-sm">Aucune rubrique trouvée</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}