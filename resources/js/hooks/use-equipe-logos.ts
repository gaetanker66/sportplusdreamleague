import { useEffect, useState, useMemo, useRef } from 'react';

// Cache global partagé entre toutes les instances du hook
const globalLogosCache: Record<number, string> = {};
const globalLoadedRef = new Set<number>();
const globalLoadingRef = new Set<number>();

// Événement personnalisé pour notifier toutes les instances d'une mise à jour du cache
const CACHE_UPDATE_EVENT = 'equipe-logos-cache-updated';

/**
 * Hook pour charger les logos des équipes de manière asynchrone
 * @param equipeIds - Tableau d'IDs d'équipes à charger
 * @returns Object contenant les logos chargés et une fonction helper pour obtenir un logo
 */
export function useEquipeLogos(equipeIds: (number | undefined)[]) {
    const [logosCache, setLogosCache] = useState<Record<number, string>>(() => ({ ...globalLogosCache }));
    const [loadingLogos, setLoadingLogos] = useState<Set<number>>(new Set());

    // Écouter les mises à jour du cache global depuis d'autres instances
    useEffect(() => {
        const handleCacheUpdate = () => {
            setLogosCache({ ...globalLogosCache });
            setLoadingLogos(new Set(globalLoadingRef));
        };

        window.addEventListener(CACHE_UPDATE_EVENT, handleCacheUpdate);
        return () => {
            window.removeEventListener(CACHE_UPDATE_EVENT, handleCacheUpdate);
        };
    }, []);

    // Nettoyer les IDs undefined et dédupliquer
    const validIds = useMemo(() => {
        const ids = new Set<number>();
        equipeIds.forEach(id => {
            if (id !== undefined && id !== null) {
                ids.add(id);
            }
        });
        return Array.from(ids);
    }, [equipeIds]);

    // Charger les logos de manière asynchrone
    useEffect(() => {
        if (validIds.length === 0) return;

        // Filtrer les IDs qui ne sont pas déjà chargés ou en cours de chargement (utiliser le cache global)
        const idsToLoad = validIds.filter(id => !globalLoadedRef.has(id) && !globalLoadingRef.has(id));
        
        if (idsToLoad.length === 0) {
            // Si tous les IDs sont déjà chargés, la mise à jour sera gérée par l'événement CACHE_UPDATE_EVENT
            // Vérifier quand même si on a besoin de synchroniser le cache local avec le global
            const hasNewData = validIds.some(id => globalLogosCache[id] && !logosCache[id]);
            if (hasNewData) {
                setLogosCache({ ...globalLogosCache });
            }
            return;
        }

        // Marquer comme en cours de chargement (global)
        idsToLoad.forEach(id => globalLoadingRef.add(id));
        setLoadingLogos(new Set(globalLoadingRef));
        
        // Notifier toutes les instances que des logos sont en cours de chargement
        window.dispatchEvent(new CustomEvent(CACHE_UPDATE_EVENT));

        // Fonction helper pour récupérer le token CSRF depuis le cookie
        const getCsrfToken = () => {
            const cookieName = 'XSRF-TOKEN';
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === cookieName) {
                    return decodeURIComponent(value);
                }
            }
            return '';
        };

        fetch('/api/equipes/logos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ ids: idsToLoad }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('La réponse n\'est pas au format JSON');
                }
                return response.json();
            })
            .then(data => {
                // Mettre à jour le cache global
                Object.assign(globalLogosCache, data);
                // Marquer comme chargés (global)
                idsToLoad.forEach(id => {
                    globalLoadedRef.add(id);
                    globalLoadingRef.delete(id);
                });
                setLoadingLogos(new Set(globalLoadingRef));
                // Mettre à jour le cache local avec le cache global
                setLogosCache({ ...globalLogosCache });
                // Notifier toutes les autres instances du hook
                window.dispatchEvent(new CustomEvent(CACHE_UPDATE_EVENT));
            })
            .catch(error => {
                console.error('Erreur lors du chargement des logos:', error);
                // En cas d'erreur, retirer du loading (global)
                idsToLoad.forEach(id => globalLoadingRef.delete(id));
                setLoadingLogos(new Set(globalLoadingRef));
                // Notifier les autres instances même en cas d'erreur
                window.dispatchEvent(new CustomEvent(CACHE_UPDATE_EVENT));
            });
    }, [validIds]);

    /**
     * Fonction helper pour obtenir le logo d'une équipe
     * @param equipeId - ID de l'équipe
     * @param fallbackLogo - Logo déjà fourni (prioritaire)
     * @returns Le logo en base64 ou undefined si pas d'image
     */
    const getLogo = (equipeId: number | undefined, fallbackLogo?: string | null): string | undefined => {
        // Vérifier si le fallback est une chaîne non vide (pas null, pas undefined, pas vide)
        if (fallbackLogo && typeof fallbackLogo === 'string' && fallbackLogo.trim().length > 0) {
            return fallbackLogo;
        }
        // Vérifier le cache global en priorité, puis le cache local
        const cachedLogo = equipeId ? (globalLogosCache[equipeId] || logosCache[equipeId]) : undefined;
        if (cachedLogo && typeof cachedLogo === 'string' && cachedLogo.trim().length > 0) {
            return cachedLogo;
        }
        return undefined;
    };

    return { getLogo, isLoading: loadingLogos.size > 0 };
}

