export type Couple = {
    id: number;
    mot1: string;
    mot2: string;
    count: number;
};

const BASE = "http://localhost:8083";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Erreur HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export const apiCouples = {
    lister(): Promise<Couple[]> {
        return request<Couple[]>("/api/qualificatifs");
    },

    creer(payload: { mot1: string; mot2: string }): Promise<void> {
        return request<void>("/api/qualificatifs", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    modifier(id: number, payload: { mot1: string; mot2: string }): Promise<void> {
        return request<void>(`/api/qualificatifs/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },

    supprimer(id: number): Promise<void> {
        return request<void>(`/api/qualificatifs/${id}`, {
            method: "DELETE",
        });
    },
};
