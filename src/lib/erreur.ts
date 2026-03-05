export function extraireMessageErreur(error: unknown): string {
    if (error && typeof error === "object") {
        const err = error as any;
        // NormalizedApiError from api.ts interceptor — message is directly on the error
        if (err.message && err.name === "ApiError") {
            return err.message;
        }
        // Fallback for raw axios errors
        if (err.response?.data?.message) {
            return err.response.data.message;
        }
        if (!err.response) {
            return "Impossible de contacter le serveur.";
        }
    }
    return "Une erreur inattendue s'est produite.";
}