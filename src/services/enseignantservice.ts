//import axios from "axios"

import api from "./api"

export interface EnseignantLightDTO {
  noEnseignant: number
  nom: string
  prenom: string
  emailUbo: string
}

export const getEnseignants = async (): Promise<EnseignantLightDTO[]> => {
  //const response = await axios.get("/api/enseignants")
    const response = await api.get("/api/enseignants")
  return response.data
}
