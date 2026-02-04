import axios from "axios"

// Ta configuration existante
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Une erreur est survenue."

    return Promise.reject(new Error(message))
  }
)

// --- AJOUT DU SERVICE RUBRIQUES ---

export interface Rubrique {
  id: string;
  titre: string;
  hasQuestions: boolean;
  ordre: number;
}

export const rubriquesService = {
  // Récupérer la liste (triée par l'ordre défini)
  getAll: async (): Promise<Rubrique[]> => {
    const { data } = await api.get<Rubrique[]>("/rubriques")
    return data.sort((a, b) => a.ordre - b.ordre)
  },

  // Créer (en envoyant le titre en majuscules pour le style UBO)
  create: async (titre: string): Promise<Rubrique> => {
    const { data } = await api.post<Rubrique>("/rubriques", { 
      titre: titre.toUpperCase() 
    })
    return data
  },

  // Mettre à jour (utile pour changer l'ordre après un Drag & Drop)
  update: async (id: string, updates: Partial<Rubrique>): Promise<Rubrique> => {
    const { data } = await api.put<Rubrique>(`/rubriques/${id}`, updates)
    return data
  },

  // Supprimer
  delete: async (id: string): Promise<void> => {
    await api.delete(`/rubriques/${id}`)
  }
}

export default api