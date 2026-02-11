import api from "./api"

export interface Question {
  idQuestion: number
  type: string
  noEnseignant: string | null
  idQualificatif: number
  intitule: string
  usedInRubrique?: boolean
}

export interface QuestionInRubrique extends Question {
  ordre: number
  maximal?: string
  minimal?: string
}

export async function getQuestions(): Promise<Question[]> {
  const { data } = await api.get<Question[]>("/api/questions")
  return data
}

export async function createQuestion(payload: {
  type?: string
  noEnseignant: string | null
  idQualificatif: number
  intitule: string
}): Promise<Question> {
  const { data } = await api.post<Question>(
    "/api/questions/create",
    payload,
  )
  return data
}

export async function updateQuestion(
  id: number,
  payload: {
    type?: string
    noEnseignant: string | null
    idQualificatif: number
    intitule: string
  },
): Promise<Question> {
  const { data } = await api.put<Question>(
    `/api/questions/update/${id}`,
    payload,
  )
  return data
}

export async function deleteQuestion(id: number): Promise<void> {
  await api.delete(`/api/questions/delete/${id}`)
}
