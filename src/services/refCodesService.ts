import api from "./api"

export interface RefCodeDTO {
  code: string
  nom: string
}

export const getRefCodes = async (domain: string): Promise<RefCodeDTO[]> => {
  const response = await api.get(`/api/ref-codes?domain=${domain}`)
  return response.data.map((c: any) => ({
    code: c.rvAbbreviation,
    nom: c.rvMeaning,
  }))
}