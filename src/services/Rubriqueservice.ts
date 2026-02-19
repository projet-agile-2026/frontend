import api from "./api"

/* ============================
   TYPES
============================ */

export interface Question {
  idQuestion: number
  intitule: string
  idQualificatif: number
  ordre: number
  maximal?: string
  minimal?: string
}

export interface Rubrique {
  idRubrique: number
  designation: string
  type: string
  ordre: number
  questions: Question[]
}

export interface CreateRubriqueRequest {
  designation: string
  type?: string
  noEnseignant?: number
  ordre?: number
}

export interface UpdateRubriqueRequest {
  designation: string
  type: string
  noEnseignant?: number
  ordre: number
}

export interface QuestionOrder {
  idQuestion: number
  ordre: number
}

export interface RubriqueOrder {
  idRubrique: number
  ordre: number
}

/* ============================
   API CALLS
============================ */

export async function getRubriques(): Promise<Rubrique[]> {
  const { data } = await api.get<Rubrique[]>("/api/rubriques")
  return data
}

export async function getRubriqueById(id: number): Promise<Rubrique> {
  const { data } = await api.get<Rubrique>(`/api/rubriques/${id}`)
  return data
}

export async function createRubrique(
  request: CreateRubriqueRequest,
): Promise<Rubrique> {
  const { data } = await api.post<Rubrique>(
    "/api/rubriques",
    request,
  )
  return data
}

export async function updateRubrique(
  id: number,
  request: UpdateRubriqueRequest,
): Promise<Rubrique> {
  const { data } = await api.put<Rubrique>(
    `/api/rubriques/${id}`,
    request,
  )
  return data
}

export async function deleteRubrique(id: number): Promise<void> {
  await api.delete(`/api/rubriques/${id}`)
}

export async function addQuestionToRubrique(
  rubriqueId: number,
  questionId: number,
  ordre: number,
): Promise<void> {
  await api.post(`/api/rubriques/${rubriqueId}/questions`, {
    idQuestion: questionId,
    ordre,
  })
}

export async function removeQuestionFromRubrique(
  rubriqueId: number,
  questionId: number,
): Promise<void> {
  await api.delete(`/api/rubriques/${rubriqueId}/questions/${questionId}`)
}

export async function reorderQuestionsInRubrique(
  rubriqueId: number,
  questionOrders: QuestionOrder[],
): Promise<void> {
  await api.put(`/api/rubriques/${rubriqueId}/questions/reorder`, {
    questionOrders,
  })
}

export async function reorderRubriques(
  type: string,
  rubriqueOrders: RubriqueOrder[],
): Promise<void> {
  await api.put(`/api/rubriques/reorder`, {
    rubriqueOrders,
  })
}
