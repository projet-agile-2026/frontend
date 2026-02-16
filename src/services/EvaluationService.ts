import api from "./api"

export type EvaluationStatus = "EN_COURS" | "TERMINE" | "BROUILLON"

export interface EvaluationListItem {
  idEvaluation: number
  anneeUniversitaire: string
  codeFormation: string
  libelleFormation?: string
  codeUe: string
  libelleUe?: string
  etat: EvaluationStatus
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
  titre: string
  questions: EvaluationQuestionPayload[]
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
  etat: EvaluationStatus
  rubriques: EvaluationRubriquePayload[]
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

