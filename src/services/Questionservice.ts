const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

export interface QuestionDTO {
  idQuestion?: number;
  type?: string;
  noEnseignant: number | null;
  idQualificatif: number;
  intitule: string;
}

class QuestionService {
  private baseUrl = `${API_BASE_URL}/questions`;

  async getAllQuestions(): Promise<any[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  }

  async getQuestionById(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  }

  async createQuestion(question: QuestionDTO): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
  }

  async updateQuestion(id: number, question: QuestionDTO): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  }

  async deleteQuestion(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete question');
  }
}

export const questionService = new QuestionService();