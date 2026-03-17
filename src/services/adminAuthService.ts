import api from "./api"

export type AdminUserDTO = {
  authId: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  role: string
  active: boolean
}

export async function getEnseignantsAuth(): Promise<AdminUserDTO[]> {
  const { data } = await api.get<AdminUserDTO[]>("/api/admin/enseignants")
  return data
}

export async function toggleUserAuth(id: number): Promise<void> {
  await api.put(`/api/admin/toggle/${id}`)
}

export async function getEtudiantsAuth(): Promise<AdminUserDTO[]> {
  const { data } = await api.get("/api/admin/etudiants")
  return data
}