const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

export interface CreateRubriqueRequest {
  designation: string;
  type?: string;
  noEnseignant?: number;
  ordre?: number;
}

export interface UpdateRubriqueRequest {
  designation: string;
  type: string;
  noEnseignant?: number;
  ordre: number;
}

export interface AddQuestionToRubriqueRequest {
  idQuestion: number;
  ordre: number;
}

export interface QuestionOrder {
  idQuestion: number;
  ordre: number;
}

export interface RubriqueOrder {
  idRubrique: number;
  ordre: number;
}

class RubriqueService {
  private baseUrl = `${API_BASE_URL}/rubriques`;

  async getAllRubriques(): Promise<any[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch rubriques');
    return response.json();
  }

  async getRubriqueById(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch rubrique');
    return response.json();
  }

  async createRubrique(request: CreateRubriqueRequest): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to create rubrique');
    return response.json();
  }

  async updateRubrique(id: number, request: UpdateRubriqueRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to update rubrique');
    return response.json();
  }

  async deleteRubrique(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete rubrique');
  }

  async addQuestionToRubrique(rubriqueId: number, questionId: number, ordre: number): Promise<void> {
    const request: AddQuestionToRubriqueRequest = {
      idQuestion: questionId,
      ordre: ordre
    };
    const response = await fetch(`${this.baseUrl}/${rubriqueId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to add question to rubrique');
  }

  async removeQuestionFromRubrique(rubriqueId: number, questionId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${rubriqueId}/questions/${questionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove question from rubrique');
  }

  async reorderQuestionsInRubrique(rubriqueId: number, questionOrders: QuestionOrder[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${rubriqueId}/questions/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionOrders })
    });
    if (!response.ok) throw new Error('Failed to reorder questions');
  }

  async reorderRubriques(type: string, rubriqueOrders: RubriqueOrder[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reorder/${type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rubriqueOrders })
    });
    if (!response.ok) throw new Error('Failed to reorder rubriques');
  }
}

export const rubriqueService = new RubriqueService();