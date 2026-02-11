import api from "./api"

export interface LoginRequest {
  email: string
  motPasse: string
}

export interface LoginResponse {
  token: string
}

export interface UserInfo {
  id: number
  role: string
  nom: string
  prenom: string
  email: string
}

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post("/api/auth/login", data)
  return response.data
}

export const logout = () => {
  localStorage.removeItem("token")
}


export async function getCurrentUser(): Promise<UserInfo> {
  const { data } = await api.get<UserInfo>("/api/auth/info")
  return data
}
