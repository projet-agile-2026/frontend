import api from "./api"

/* ===========================
   TYPES
=========================== */

export interface EtudiantRequestDTO {
  nom: string
  prenom: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  telephone?: string
  mobile?: string
  email: string
  emailUbo?: string
  adresse: string
  codePostal?: string
  ville: string
  paysOrigine: string
  universiteOrigine: string
  groupeTp?: number
  groupeAnglais?: number
}

export interface EtudiantResponseDTO {
  noEtudiant: number
  codeFormation: string
  anneeUniversitaire: string
  nom: string
  prenom: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  telephone?: string
  mobile?: string
  email: string
  emailUbo?: string
  adresse: string
  codePostal?: string
  ville: string
  paysOrigine: string
  universiteOrigine: string
  groupeTp?: number
  groupeAnglais?: number
}

/* ===========================
   API CALLS
=========================== */

export async function getEtudiantsByPromotion(
  codeFormation: string,
  anneeUniversitaire: string
): Promise<EtudiantResponseDTO[]> {
  const { data } = await api.get(
    `/api/promotions/${codeFormation}/${anneeUniversitaire}/etudiants`
  )
  return data
}

export async function addEtudiantToPromotion(
  codeFormation: string,
  anneeUniversitaire: string,
  payload: EtudiantRequestDTO
): Promise<EtudiantResponseDTO> {
  const { data } = await api.post(
    `/api/promotions/${codeFormation}/${anneeUniversitaire}/etudiants`,
    payload
  )
  return data
}

export async function updateEtudiant(
  noEtudiant: number,
  payload: EtudiantRequestDTO
): Promise<EtudiantResponseDTO> {
  const { data } = await api.put(
    `/api/etudiants/${noEtudiant}`,
    payload
  )
  return data
}

export async function deleteEtudiant(
  noEtudiant: number
): Promise<void> {
  await api.delete(`/api/etudiants/${noEtudiant}`)
}
