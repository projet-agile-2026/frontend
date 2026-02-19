import axios from "axios"

export interface EnseignantLightDTO {
  noEnseignant: number
  nom: string
  prenom: string
  emailUbo: string
}

export const getEnseignants = async (): Promise<EnseignantLightDTO[]> => {
  const response = await axios.get("/api/enseignants")
  return response.data
}
