import api from "./api"

export type EvaluationStatus = "ELA" | "DIS" | "CLO"

export interface QuestionEvaluationDTO {
  idQuestionEvaluation: number
  idQuestion: number
  intitule: string
}

export interface RubriqueEvaluationDTO {
  idRubriqueEvaluation: number
  idEvaluation: number
  idRubrique: number
  ordre: number
  designation: string
  type?: string
  questions: QuestionEvaluationDTO[]
}

export interface EvaluationWithRubriquesDTO {
  idEvaluation: number
  codeFormation: string
  anneeUniversitaire: string
  codeUe: string
  codeEc: string
  designation: string
  etat: "ELA" | "DIS" | "CLO"
  periode: string
  noEvaluation: number | ""
  debutReponse: string
  finReponse: string
  rubriques: RubriqueEvaluationDTO[]
}

export interface EvaluationListItem {
  idEvaluation: number
  anneeUniversitaire: string
  codeFormation: string
  libelleFormation?: string
  codeUe: string
  libelleUe?: string
  etat: "ELA" | "DIS" | "CLO"
  periode: string
  debutReponse: string
  finReponse: string
}

export interface EvaluationFilters {
  search?: string
  anneeUniversitaire?: string
  onlyCurrentYear?: boolean
}

export interface EvaluationQuestionPayload {
  idQuestion?: number
  intitule: string
}

export interface EvaluationRubriquePayload {
  idRubrique?: number
  designation: string
  questions: {
    idQuestion?: number
  }[]
}

export interface EvaluationDetailDTO {
  id?: number
  anneeUniversitaire: string
  codeFormation: string
  codeUe: string
  codeEc: string
  designation: string
  debutReponse: string
  finReponse: string
  etat: "ELA" | "DIS" | "CLO"
  periode: string
  rubriques: EvaluationRubriquePayload[]
  noEvaluation: number
}

export interface RubriqueEvaluationOrder {
  idRubriqueEvaluation: number
  ordre: number
}

export interface ReorderRubriquesPayload {
  rubriqueOrders: RubriqueEvaluationOrder[]
}

export interface QuestionEvaluationOrder {
  idQuestionEvaluation: number
  ordre: number
}

export interface ReorderQuestionsPayload {
  questionOrders: QuestionEvaluationOrder[]
}

export interface DroitResponseDTO {
  idEvaluation: number
  noEnseignant: number
  consultation: "O" | "N"
  duplication: "O" | "N"
}

export interface DroitRequestDTO {
  noEnseignant: number
  consultation: boolean
  duplication: boolean
}

export interface DroitTousRequestDTO {
  consultation: boolean
  duplication: boolean
}

export async function getEvaluations(
  filters?: EvaluationFilters,
): Promise<EvaluationListItem[]> {
  const { data } = await api.get<EvaluationListItem[]>(
    "/api/enseignant/evaluations",
    {
      params: filters,
    },  
  )
  return data
}

export async function getEvaluation(id: number): Promise<EvaluationDetailDTO> {
  const { data } = await api.get<EvaluationDetailDTO>(
    `/api/enseignant/evaluations/${id}`,
  )
  return data
}

export async function getFormations(): Promise<String[]> {
  const { data } = await api.get<String[]>(
    "/api/enseignant/evaluations/formations",
  )
  return data
}

export async function getUes(codeFormation: string): Promise<String[]> {
  const { data } = await api.get<String[]>(
    `/api/enseignant/evaluations/formations/${codeFormation}/ues`,
  )
  return data
}

export async function getEcs(
  codeFormation: string,
  codeUe: string,
): Promise<String[]> {
  const { data } = await api.get<String[]>(
    `/api/enseignant/evaluations/formations/${codeFormation}/ues/${codeUe}/ecs`,
  )
  return data
}

export async function createEvaluation(
  payload: EvaluationDetailDTO,
): Promise<EvaluationDetailDTO> {
  const { data } = await api.post<EvaluationDetailDTO>(
    "/api/enseignant/evaluations",
    payload,
  )
  return data
}

export async function updateEvaluation(
  id: number,
  payload: EvaluationDetailDTO,
): Promise<EvaluationDetailDTO> {
  const { data } = await api.put<EvaluationDetailDTO>(
    `/api/enseignant/evaluations/${id}`,
    payload,
  )
  return data
}

export async function deleteEvaluation(id: number): Promise<void> {
  await api.delete(`/api/enseignant/evaluations/${id}`)
}

export async function addRubriqueToEvaluation(
  evaluationId: number,
  idRubrique: number
): Promise<RubriqueEvaluationDTO> {
  const { data } = await api.post(
    `/api/enseignant/evaluations/${evaluationId}/rubriques`,
    { idRubrique }
  )
  return data
} 

export async function addQuestionToRubriqueEvaluation(
  evaluationId: number,
  rubriqueEvaluationId: number,
  idQuestion: number
): Promise<RubriqueEvaluationDTO> {
  const { data } = await api.post(
    `/api/enseignant/evaluations/${evaluationId}/rubriques/${rubriqueEvaluationId}/questions`,
    { idQuestion }
  )
  return data
}

export async function getEvaluationFull(
  id: number
): Promise<EvaluationWithRubriquesDTO> {
  const { data } = await api.get(
    `/api/enseignant/evaluations/${id}/rubriques`
  )
  return data
}

export async function removeQuestionFromRubriqueEvaluation(
  evaluationId: number,
  rubriqueEvaluationId: number,
  questionEvaluationId: number
) {
  await api.delete(
    `/api/enseignant/evaluations/${evaluationId}/rubriques/${rubriqueEvaluationId}/questions/${questionEvaluationId}`
  )
}

export async function removeRubriqueFromEvaluation(
  evaluationId: number,
  rubriqueEvaluationId: number
) {
  await api.delete(
    `/api/enseignant/evaluations/${evaluationId}/rubriques/${rubriqueEvaluationId}`
  )
}

export async function reorderRubriquesInEvaluation(
  evaluationId: number,
  payload: ReorderRubriquesPayload
): Promise<void> {
  await api.put(
    `/api/enseignant/evaluations/${evaluationId}/rubriques/reorder`,
    payload
  )
}

export async function reorderQuestionsInRubriqueEvaluation(
  evaluationId: number,
  rubriqueEvaluationId: number,
  payload: ReorderQuestionsPayload
): Promise<void> {
  await api.put(
    `/api/enseignant/evaluations/${evaluationId}/rubriques/${rubriqueEvaluationId}/questions/reorder`,
    payload
  )
}

export async function getEvaluationsPartagees(): Promise<EvaluationListItem[]> {
  const { data } = await api.get<EvaluationListItem[]>(
    "/api/enseignant/evaluations/partagees"
  )
  return data
}

export async function dupliquerEvaluation(
  idEvaluation: number
): Promise<EvaluationDetailDTO> {
  const { data } = await api.post<EvaluationDetailDTO>(
    `/api/enseignant/evaluations/${idEvaluation}/dupliquer`
  )
  return data
}

export async function getDroits(
  idEvaluation: number
): Promise<DroitResponseDTO[]> {
  const { data } = await api.get<DroitResponseDTO[]>(
    `/api/enseignant/evaluations/${idEvaluation}/droits`
  )
  return data
}

export async function upsertDroit(
  idEvaluation: number,
  payload: DroitRequestDTO
): Promise<DroitResponseDTO> {
  const { data } = await api.post<DroitResponseDTO>(
    `/api/enseignant/evaluations/${idEvaluation}/droits`,
    payload
  )
  return data
}

export async function deleteDroit(
  idEvaluation: number,
  noEnseignantCible: number
): Promise<void> {
  await api.delete(
    `/api/enseignant/evaluations/${idEvaluation}/droits/${noEnseignantCible}`
  )
}

export async function donnerDroitATous(
  idEvaluation: number,
  payload: DroitTousRequestDTO
): Promise<DroitResponseDTO> {
  const { data } = await api.post<DroitResponseDTO>(
    `/api/enseignant/evaluations/${idEvaluation}/droits/tous`,
    payload
  )
  return data
}

export async function getAnneesUniversitaires(
  codeFormation: string
): Promise<string[]> {
  const { data } = await api.get<string[]>(
    `/api/enseignant/evaluations/formations/${codeFormation}/annees`
  )
  return data
}

