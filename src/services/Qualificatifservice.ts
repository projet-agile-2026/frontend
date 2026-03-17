import api from "./api"

export type QualificatifDTO = {
  id?: number
  mot1: string
  mot2: string
  count?: number
}

export async function getQualificatifs(): Promise<QualificatifDTO[]> {
  const { data } = await api.get<QualificatifDTO[]>("/api/qualificatifs")
  return data
}

export async function getQualificatif(id: number): Promise<QualificatifDTO> {
  const { data } = await api.get<QualificatifDTO>(`/api/qualificatifs/${id}`)
  return data
}

export async function createQualificatif(
  payload: QualificatifDTO,
): Promise<QualificatifDTO> {
  const { data } = await api.post<QualificatifDTO>(
    "/api/qualificatifs",
    payload,
  )
  return data
}

export async function updateQualificatif(
  id: number,
  payload: QualificatifDTO,
): Promise<QualificatifDTO> {
  const { data } = await api.put<QualificatifDTO>(
    `/api/qualificatifs/${id}`,
    payload,
  )
  return data
}

export async function deleteQualificatif(id: number): Promise<void> {
  await api.delete(`/api/qualificatifs/${id}`)
}
