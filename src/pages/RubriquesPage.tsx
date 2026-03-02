import  React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, GripVertical, Trash2, Edit2, ChevronDown, ChevronRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
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
import type { DragEndEvent } from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import services
import {
  getRubriques,
  createRubrique,
  updateRubrique,
  deleteRubrique,
  addQuestionToRubrique,
  removeQuestionFromRubrique,
  reorderQuestionsInRubrique,
  reorderRubriques,
} from "../services/Rubriqueservice"

import {
  getQuestions
} from "../services/Questionservice"
import {
  getQualificatifs
} from "../services/Qualificatifservice"
import { getCurrentUser, type UserInfo } from "../services/authService"

// TYPES & INTERFACES
import type { QualificatifDTO as Qualificatif } from "../services/Qualificatifservice"
import type { Question } from "../services/Questionservice"
import type { QuestionInRubrique } from "../services/Questionservice"

interface Rubrique {
  idRubrique: number;
  designation: string;
  type: string;
  ordre: number;
  questions: QuestionInRubrique[];
  isExpanded: boolean;
}

// SORTABLE QUESTION ROW
interface SortableQuestionRowProps {
  question: Question;
  rubriqueId: number;
  qualificatifs: Qualificatif[];
  onDelete: (rubriqueId: number, questionId: number) => void;
  canEdit: boolean;
}

const SortableQuestionRow = ({ question, rubriqueId, qualificatifs, onDelete, canEdit }: SortableQuestionRowProps) => {
  const sortable = canEdit ? useSortable({
    id: question.idQuestion.toString()
  }) : { attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, transition: undefined, isDragging: false };
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

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
          {canEdit && (
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <GripVertical size={16} />
            </div>
          )}

          <div className="flex-1 grid grid-cols-12 gap-2 sm:gap-4 items-center min-w-0">
            <div className={`col-span-12 text-sm text-gray-900 truncate ${canEdit ? "sm:col-span-5" : "sm:col-span-6"}`}>{question.intitule}</div>
            <div className="col-span-12 sm:col-span-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${question.type === 'QUS' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {question.type === 'QUS' ? 'Standard' : 'Personnelle'}
              </span>
            </div>
            <div className="col-span-12 sm:col-span-5 text-sm text-gray-600 truncate">{qualificatifLabel}</div>
            {canEdit && (
            <div className="col-span-12 sm:col-span-1 flex justify-end gap-2 flex-shrink-0">
              <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  title="Retirer de la rubrique"
              >
                <Trash2 size={14} />
              </button>
            </div>
            )}
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
  availableQuestions: Question[];
  onToggleExpand: (id: number) => void;
  onDeleteRubrique: (id: number) => void;
  onEditRubrique: (id: number, newDesignation: string) => void;
  onAddQuestion: (rubriqueId: number, selectedQuestionId: number) => void;
  onDeleteQuestion: (rubriqueId: number, questionId: number) => void;
  onDragQuestionEnd: (rubriqueId: number, event: DragEndEvent) => void;
  canEdit: boolean;
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
                               onDragQuestionEnd,
                               canEdit
                             }: SortableRubriqueRowProps) => {
  const sortable = canEdit ? useSortable({
    id: rubrique.idRubrique.toString()
  }) : { attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, transition: undefined, isDragging: false };
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const [editValue, setEditValue] = useState(rubrique.designation);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState<"QUS" | "QUP">("QUS");
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
      .filter(q => q.type === selectedQuestionType)
      .filter(q => q.intitule.toLowerCase().includes(questionSearch.toLowerCase()));

  const handleAddQuestion = () => {
    if (!selectedQuestionId) return;
    onAddQuestion(rubrique.idRubrique, parseInt(selectedQuestionId));
    setSelectedQuestionId("");
    setQuestionSearch("");
    setSelectedQuestionType("QUS");
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
          <div className="group flex items-center gap-2 py-3 px-3 sm:px-4 bg-gray-50 hover:bg-gray-100 transition-colors min-w-0">
            {canEdit && (
              <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <GripVertical size={18} />
              </div>
            )}

            <button
                onClick={() => onToggleExpand(rubrique.idRubrique)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              {rubrique.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
              <span className="font-bold text-gray-900 truncate">{rubrique.designation}</span>
              {rubrique.questions.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                {rubrique.questions.length}
              </span>
              )}
            </div>

            {canEdit && (
              <div className="flex items-center gap-2 flex-shrink-0 transition-opacity">
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
                    {/* Type Tabs */}
                    <div className="bg-gray-50 p-1 rounded-lg border border-gray-200">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedQuestionType("QUS");
                            setSelectedQuestionId("");
                          }}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                            selectedQuestionType === "QUS"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-transparent text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Questions Standard (QUS)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestionType("QUP");
                            setSelectedQuestionId("");
                          }}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                            selectedQuestionType === "QUP"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-transparent text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Questions Personnelles (QUP)
                        </button>
                      </div>
                    </div>
                    
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
                              const qual = qualificatifs.find(qf => qf.idQualificatif === q.idQualificatif);
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
                <DialogContent className="w-[calc(100%-2rem)] max-w-md">
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
            )}
          </div>

          {/* Questions List */}
          {rubrique.isExpanded && (
              <div className="bg-white">
                {rubrique.questions.length > 0 ? (
                    <>
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-9 py-2 bg-gray-100 border-t border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                        <div className={canEdit ? "col-span-12 sm:col-span-5" : "col-span-12 sm:col-span-6"}>Question</div>
                        <div className="col-span-12 sm:col-span-1">Type</div>
                        <div className="col-span-12 sm:col-span-5">Couples de qualificatifs</div>
                        {canEdit && (
                          <div className="col-span-12 sm:col-span-1 text-right">Actions</div>
                        )}
                      </div>
                      {/* Questions with DnD */}
                      {canEdit ? (
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
                                    canEdit={canEdit}
                                />
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <>
                          {rubrique.questions.map((question) => (
                              <SortableQuestionRow
                                  key={question.idQuestion}
                                  question={question}
                                  rubriqueId={rubrique.idRubrique}
                                  qualificatifs={qualificatifs}
                                  onDelete={onDeleteQuestion}
                                  canEdit={canEdit}
                              />
                          ))}
                        </>
                      )}
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
export function RubriquesPage() {
  const [search, setSearch] = useState("");
  const [isAddRubriqueOpen, setIsAddRubriqueOpen] = useState(false);
  const [newRubriqueTitle, setNewRubriqueTitle] = useState("");
  const [rubriques, setRubriques] = useState<Rubrique[]>([]);
  const [qualificatifs, setQualificatifs] = useState<Qualificatif[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedType, setSelectedType] = useState<"RBS" | "RBP">("RBS");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      // Si enseignant, afficher par défaut les rubriques personnelles
      if (userData.role === "ENS") {
        setSelectedType("RBP");
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [qualificatifsData, rubriquesData, questionsData] = await Promise.all([
        getQualificatifs(),
        getRubriques(),
        getQuestions()
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

  // Vérification des permissions
  const canEdit = useMemo(() => {
    if (!user) return false;
    if (user.role === "ADM") return true; // Admin peut tout faire
    if (user.role === "ENS" && selectedType === "RBP") return true; // Enseignant peut gérer RBP
    return false; // Enseignant ne peut pas gérer RBS
  }, [user, selectedType]);

  const filteredRubriques = useMemo(
      () => rubriques
        .filter(r => r.type === selectedType)
        .filter(r => r.designation.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.designation.localeCompare(b.designation)),
      [rubriques, search, selectedType]
  );

  const handleAddRubrique = async () => {
    if (!newRubriqueTitle.trim()) return;

    try {
      const newRubrique = await createRubrique({
        designation: newRubriqueTitle.toUpperCase(),
        type: selectedType
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

      await updateRubrique(id, {
        designation: newDesignation.toUpperCase(),
        type: rubrique.type,
        ordre: rubrique.ordre
      });

      setRubriques(prev => prev.map(r =>
          r.idRubrique === id ? { ...r, designation: newDesignation.toUpperCase() } : r
      ));
      
      // Afficher la notification de succès
      setSuccessMessage(`Rubrique "${newDesignation.toUpperCase()}" modifiée avec succès`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err: any) {
      console.error('Error updating rubrique:', err);
      alert('Erreur lors de la mise à jour de la rubrique');
    }
  };

  const handleDeleteRubrique = async (id: number) => {
    try {
      const rubrique = rubriques.find(r => r.idRubrique === id);
      const rubriqueNom = rubrique?.designation || '';
      
      await deleteRubrique(id);
      setRubriques(prev => prev.filter(r => r.idRubrique !== id));
      
      // Afficher la notification de succès
      setSuccessMessage(`Rubrique "${rubriqueNom}" supprimée avec succès`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
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

        await reorderRubriques(selectedType, rubriqueOrders);
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
      const question = availableQuestions.find(q => q.idQuestion === selectedQuestionId);
      const questionNom = question?.intitule || '';

      await addQuestionToRubrique(rubriqueId, selectedQuestionId, ordre);
      await loadData();
      
      // Afficher la notification de succès
      setSuccessMessage(`Question "${questionNom}" ajoutée avec succès à la rubrique`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err: any) {
      console.error('Error adding question:', err);
      alert('Erreur lors de l\'ajout de la question');
    }
  };

  const handleDeleteQuestion = async (rubriqueId: number, questionId: number) => {
    try {
      const rubrique = rubriques.find(r => r.idRubrique === rubriqueId);
      const question = rubrique?.questions.find(q => q.idQuestion === questionId);
      const questionNom = question?.intitule || '';
      
      await removeQuestionFromRubrique(rubriqueId, questionId);

      setRubriques(prev => prev.map(r =>
          r.idRubrique === rubriqueId
              ? { ...r, questions: r.questions.filter(q => q.idQuestion !== questionId) }
              : r
      ));
      
      // Afficher la notification de succès
      setSuccessMessage(`Question "${questionNom}" retirée avec succès de la rubrique`);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
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

        await reorderQuestionsInRubrique(rubriqueId, questionOrders);
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
      <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:p-6 min-w-0">
        {/* Success Notification */}
        {showSuccessNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px]">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-green-500 hover:text-green-700 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            {user?.role === "ADM" 
              ? "Gestion des Rubriques Standards" 
              : "Gestion des Rubriques"}
          </h1>

          {/* Type Tabs - Hidden for Admin */}
          {user?.role !== "ADM" && (
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType("RBS")}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  selectedType === "RBS"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Rubriques Standard
                
              </button>
              <button
                onClick={() => setSelectedType("RBP")}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  selectedType === "RBP"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Rubriques Personnelles
              </button>
            </div>
          </div>
          )}

          {/* Search and Add Button */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-full min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Filtrer par nom de rubrique..."
                    className="pl-9 h-10 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {canEdit && (
                <Dialog open={isAddRubriqueOpen} onOpenChange={setIsAddRubriqueOpen}>
                  <DialogTrigger asChild>
                    <Button className={`${
                      selectedType === "RBS" 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-purple-600 hover:bg-purple-700"
                    } text-white h-10 w-full sm:w-auto`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une rubrique {selectedType === "RBS" ? "standard" : "personnelle"}
                    </Button>
                  </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto sm:max-h-none">
                  <DialogHeader>
                    <DialogTitle>
                      Nouvelle Rubrique {selectedType === "RBS" ? "Standard" : "Personnelle"}
                    </DialogTitle>
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
              )}
            </div>
          </div>
        </div>

        {/* Rubriques List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm truncate">
              Rubriques {selectedType === "RBS" ? "Standard" : "Personnelles"} <span className="text-gray-400 font-normal">({filteredRubriques.length} résultat{filteredRubriques.length > 1 ? 's' : ''})</span>
            </h2>
          </div>

          <div className="p-3 sm:p-4 min-w-0">
            {filteredRubriques.length > 0 ? (
                canEdit ? (
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
                                canEdit={canEdit}
                            />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
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
                            canEdit={canEdit}
                        />
                    ))}
                  </div>
                )
            ) : (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-sm">Aucune rubrique {selectedType === "RBS" ? "standard" : "personnelle"} trouvée</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}