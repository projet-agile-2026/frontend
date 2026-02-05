const API_URL = "http://localhost:8080/api/v1/questions";

export const questionService = {
  getAll: async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erreur réseau');
    return await response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la création');
    return await response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return await response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
    if (response.status === 409) {
      const error = await response.json();
      throw new Error(error.message);
    }
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return true;
  }
};