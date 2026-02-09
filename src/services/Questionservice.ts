const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/v1/api';

export interface Question {
  idQuestion: number;
  type: string;
  noEnseignant: string | null;
  idQualificatif: string;
  intitule: string;
}

export interface CreateQuestionRequest {
  type?: string;
  noEnseignant: string | null;
  idQualificatif: number;
  intitule: string;
}

export interface UpdateQuestionRequest {
  type?: string;
  noEnseignant: string | null;
  idQualificatif: number;
  intitule: string;
}

class QuestionService {
  private baseUrl = `${API_BASE_URL}/questions`;

  async getAll(): Promise<Question[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Erreur réseau');
    return response.json();
  }

  async create(data: CreateQuestionRequest): Promise<Question> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        type: data.type || 'QST'
      }),
    });
    if (!response.ok) throw new Error('Erreur lors de la création');
    return response.json();
  }

  async update(id: number, data: UpdateQuestionRequest): Promise<Question> {
    const response = await fetch(`${this.baseUrl}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        type: data.type || 'QST'
      }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return response.json();
  }

  async delete(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/delete/${id}`, {
      method: 'DELETE'
    });

    if (response.status === 409) {
      const error = await response.json();
      throw new Error(error.message);
    }
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return true;
  }
}

export const questionService = new QuestionService();