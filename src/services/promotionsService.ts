import api from "./api"

/* ===========================
   TYPES
=========================== */

export interface PromotionResponseDTO {
  codeFormation: string
  anneeUniversitaire: string
  noEnseignant?: number
  siglePromotion?: string
  nbMaxEtudiant: number
  dateReponseLp?: string
  dateReponseLalp?: string
  dateRentree?: string
  lieuRentree?: string
  processusStage?: string
  commentaire?: string
  enseignantNom?: string
  enseignantPrenom?: string
  nomFormation?: string
  diplome?: string
}

export interface PromotionCreateUpdateDTO {
  codeFormation: string
  anneeUniversitaire: string
  noEnseignant?: number
  siglePromotion?: string
  nbMaxEtudiant: number
  dateReponseLp?: string
  dateReponseLalp?: string
  dateRentree?: string
  lieuRentree?: string
  processusStage?: string
  commentaire?: string
}

/* ===========================
   API CALLS
=========================== */

export async function getPromotions(params?: {
  anneeUniversitaire?: string
  diplome?: string
  nomFormation?: string
}): Promise<PromotionResponseDTO[]> {
  const { data } = await api.get("/api/promotions", { params })
  return data
}

export async function getPromotion(
  codeFormation: string,
  anneeUniversitaire: string
): Promise<PromotionResponseDTO> {
  const { data } = await api.get(
    `/api/promotions/${codeFormation}/${anneeUniversitaire}`
  )
  return data
}

export async function createPromotion(
  payload: PromotionCreateUpdateDTO
): Promise<PromotionResponseDTO> {
  const { data } = await api.post("/api/promotions", payload)
  return data
}

export async function updatePromotion(
  codeFormation: string,
  anneeUniversitaire: string,
  payload: PromotionCreateUpdateDTO
): Promise<PromotionResponseDTO> {
  const { data } = await api.put(
    `/api/promotions/${codeFormation}/${anneeUniversitaire}`,
    payload
  )
  return data
}

export async function deletePromotion(
  codeFormation: string,
  anneeUniversitaire: string
): Promise<void> {
  await api.delete(`/api/promotions/${codeFormation}/${anneeUniversitaire}`)
}
