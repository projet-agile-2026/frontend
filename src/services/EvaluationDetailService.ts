import api from "./api"

export interface EvaluationDetailDTO {
  idEvaluation: number
  nomEnseignant: string
  prenomEnseignant: string
  codeUe: string
  codeEc: string
  noEvaluation: number
  designation: string
  etat: string
  finReponse: string
  rubriques: RubriqueDetailDTO[]
}

export interface RubriqueDetailDTO {
  idRubriqueEvaluation: number
  designation: string
  ordre: number
  questions: QuestionDetailDTO[]
}

export interface QuestionDetailDTO {
  idQuestionEvaluation: number
  intitule: string
  ordre: number
  minimal?: string
  maximal?: string
}

export interface ReponseQuestionDTO {
  idQuestionEvaluation: number
  positionnement: number
}

export interface ReponseEvaluationRequestDTO {
  idEvaluation: number
  commentaire: string
  reponses: ReponseQuestionDTO[]
}

export interface ReponseEvaluationResultDTO {
  idEvaluation: number
  nomEnseignant: string
  prenomEnseignant: string
  codeUe: string
  codeEc: string
  noEvaluation: number
  designation: string
  etat: string
  finReponse: string
  commentaire: string
  rubriques: RubriqueResultDTO[]
}

export interface RubriqueResultDTO {
  idRubriqueEvaluation: number
  designation: string
  ordre: number
  questions: QuestionResultDTO[]
}

export interface QuestionResultDTO {
  idQuestionEvaluation: number
  intitule: string
  ordre: number
  minimal?: string
  maximal?: string
  positionnement: number // La réponse de l'étudiant (1-5)
}

/**
 * Récupère les détails d'une évaluation avec rubriques et questions
 */
export async function getEvaluationDetail(idEvaluation: number): Promise<EvaluationDetailDTO> {
  const response = await api.get<EvaluationDetailDTO>(`/api/evaluation-reponses/evaluations/${idEvaluation}`)
  return response.data
}

/**
 * Soumet les réponses d'un étudiant à une évaluation
 */
export async function submitReponses(request: ReponseEvaluationRequestDTO): Promise<void> {
  await api.post("/api/evaluation-reponses/reponses", request)
}

/**
 * Récupère les résultats d'une évaluation avec les réponses de l'étudiant
 */
export async function getEvaluationResult(idEvaluation: number): Promise<ReponseEvaluationResultDTO> {
  const response = await api.get<ReponseEvaluationResultDTO>(`/api/evaluation-reponses/evaluations/${idEvaluation}/resultat`)
  return response.data
}
