const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

export interface QualificatifDTO {
  idQualificatif?: number;
  maximal: string;
  minimal: string;
}

class QualificatifService {
  private baseUrl = `${API_BASE_URL}/qualificatifs`;

  async getAllQualificatifs(): Promise<any[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch qualificatifs');
    return response.json();
  }

  async getQualificatifById(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch qualificatif');
    return response.json();
  }

  async createQualificatif(qualificatif: QualificatifDTO): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificatif)
    });
    if (!response.ok) throw new Error('Failed to create qualificatif');
    return response.json();
  }

  async updateQualificatif(id: number, qualificatif: QualificatifDTO): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qualificatif)
    });
    if (!response.ok) throw new Error('Failed to update qualificatif');
    return response.json();
  }

  async deleteQualificatif(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete qualificatif');
  }
}

export const qualificatifService = new QualificatifService();