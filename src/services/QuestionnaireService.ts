import api from "./api"

export interface QuestionDTO {
  idQuestionEvaluation: number
  idQuestion: number
  intitule: string
}

export interface RubriqueQuestionnaireDTO {
  idRubriqueQuestionnaire: number
  idQuestionnaire: number
  idRubrique: number
  ordre: number
  designation: string
  type?: string
  questions: QuestionDTO[]
}

export interface QuestionnaireDTO {
  idQuestionnaire: number
  designation: string
}

export interface QuestionnaireWithRubriquesDTO {
  idQuestionnaire: number
  designation: string
  rubriques: RubriqueQuestionnaireDTO[]
}

export async function getQuestionnaires(): Promise<QuestionnaireDTO[]> {
  const { data } = await api.get("/api/admin/questionnaires")
  return data
}

export async function getQuestionnaireFull(
  id: number
): Promise<QuestionnaireWithRubriquesDTO> {
  const { data } = await api.get(`/api/admin/questionnaires/${id}`)
  return data
}

export async function createQuestionnaire(
  designation: string
): Promise<QuestionnaireDTO> {
  const { data } = await api.post("/api/admin/questionnaires", {
    designation
  })
  return data
}

export async function updateQuestionnaire(
  id: number,
  designation: string
) {
  const { data } = await api.put(`/api/admin/questionnaires/${id}`, {
    designation
  })
  return data
}

export async function deleteQuestionnaire(id: number) {
  await api.delete(`/api/admin/questionnaires/${id}`)
}

export async function addRubriqueToQuestionnaire(
  questionnaireId: number,
  idRubrique: number
) {
  const { data } = await api.post(
    `/api/admin/questionnaires/${questionnaireId}/rubriques`,
    { idRubrique }
  )
  return data
}

export async function addQuestionToRubriqueQuestionnaire(
  questionnaireId: number,
  rubriqueQuestionnaireId: number,
  idQuestion: number
) {
  const { data } = await api.post(
    `/api/admin/questionnaires/${questionnaireId}/rubriques/${rubriqueQuestionnaireId}/questions`,
    { idQuestion }
  )
  return data
}

export async function removeRubriqueFromQuestionnaire(
  questionnaireId: number,
  rubriqueQuestionnaireId: number
) {
  await api.delete(
    `/api/admin/questionnaires/${questionnaireId}/rubriques/${rubriqueQuestionnaireId}`
  )
}

export async function removeQuestionFromRubriqueQuestionnaire(
  questionnaireId: number,
  rubriqueQuestionnaireId: number,
  questionEvaluationId: number
) {
  await api.delete(
    `/api/admin/questionnaires/${questionnaireId}/rubriques/${rubriqueQuestionnaireId}/questions/${questionEvaluationId}`
  )
}