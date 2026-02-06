import api from "./api"

export interface LoginRequest {
  email: string
  motPasse: string
}

export interface LoginResponse {
  token: string
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

