import axios from "axios";

export type Couple = {
  id: number;
  mot1: string;
  mot2: string;
  count: number;
};

// Instance Axios centralisée
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8083",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   SERVICE COUPLES
============================ */

export const apiCouples = {
  lister: async (): Promise<Couple[]> => {
    const { data } = await api.get<Couple[]>("/api/qualificatifs");
    return data;
  },

  creer: async (payload: { mot1: string; mot2: string }): Promise<void> => {
    await api.post("/api/qualificatifs", payload);
  },

  modifier: async (
      id: number,
      payload: { mot1: string; mot2: string }
  ): Promise<void> => {
    await api.put(`/api/qualificatifs/${id}`, payload);
  },

  supprimer: async (id: number): Promise<void> => {
    await api.delete(`/api/qualificatifs/${id}`);
  },
};

/* ============================
   SERVICE RUBRIQUES
============================ */

export interface Rubrique {
  id: string;
  titre: string;
  hasQuestions: boolean;
  ordre: number;
}

export const rubriquesService = {
  getAll: async (): Promise<Rubrique[]> => {
    const { data } = await api.get<Rubrique[]>("/rubriques");
    return data.sort((a, b) => a.ordre - b.ordre);
  },

  create: async (titre: string): Promise<Rubrique> => {
    const { data } = await api.post<Rubrique>("/rubriques", {
      titre: titre.toUpperCase(),
    });
    return data;
  },

  update: async (
      id: string,
      updates: Partial<Rubrique>
  ): Promise<Rubrique> => {
    const { data } = await api.put<Rubrique>(
        `/rubriques/${id}`,
        updates
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/rubriques/${id}`);
  },
};

export default api;