import { toast } from 'sonner';
import { router } from '@inertiajs/react';

/**
 * Helper pour ajouter automatiquement les toasts aux actions router
 */
export function routerWithToast(
    method: 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    options?: {
        onSuccess?: (page: any) => void;
        onError?: (errors: any) => void;
        successMessage?: string;
        errorMessage?: string;
        [key: string]: any;
    }
) {
    const { onSuccess, onError, successMessage, errorMessage, ...routerOptions } = options || {};

    router[method](url, data, {
        ...routerOptions,
        onSuccess: (page) => {
            // Afficher le toast de succès si un message est fourni
            if (successMessage) {
                toast.success(successMessage);
            }
            // Appeler le callback onSuccess personnalisé s'il existe
            if (onSuccess) {
                onSuccess(page);
            }
        },
        onError: (errors) => {
            // Afficher le toast d'erreur
            const message = errorMessage || 'Une erreur est survenue.';
            toast.error(message);
            
            // Afficher les erreurs de validation si elles existent
            if (errors && typeof errors === 'object') {
                const errorMessages = Object.values(errors).flat() as string[];
                if (errorMessages.length > 0) {
                    errorMessages.forEach((msg) => {
                        if (typeof msg === 'string') {
                            toast.error(msg);
                        }
                    });
                }
            }
            
            // Appeler le callback onError personnalisé s'il existe
            if (onError) {
                onError(errors);
            }
        },
    });
}

