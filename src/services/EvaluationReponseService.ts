import api from "./api"

export interface EvaluationEtudiantDTO {
  idEvaluation: number
  noEnseignant: number
  nomEnseignant: string
  prenomEnseignant: string
  codeFormation: string
  anneeUniversitaire: string
  codeUe: string
  codeEc: string
  noEvaluation: number
  designation: string
  etat: string
  periode: string
  debutReponse: string
  finReponse: string
  dejaRepondu: boolean
}

/**
 * Récupère toutes les évaluations de la promotion de l'étudiant connecté
 */
export async function getEvaluationsEtudiant(): Promise<EvaluationEtudiantDTO[]> {
  const response = await api.get<EvaluationEtudiantDTO[]>("/api/evaluation-reponses/evaluations")
  return response.data
}
