import { useEffect, useState, useMemo, useRef } from 'react';

/**
 * Hook pour charger les logos des ligues de manière asynchrone
 * @param ligueIds - Tableau d'IDs de ligues à charger
 * @returns Object contenant les logos chargés et une fonction helper pour obtenir un logo
 */
export function useLigueLogos(ligueIds: (number | undefined)[]) {
    const [logosCache, setLogosCache] = useState<Record<number, string>>({});
    const [loadingLogos, setLoadingLogos] = useState<Set<number>>(new Set());
    const loadedRef = useRef<Set<number>>(new Set());
    const loadingRef = useRef<Set<number>>(new Set());

    // Nettoyer les IDs undefined et dédupliquer
    const validIds = useMemo(() => {
        const ids = new Set<number>();
        ligueIds.forEach(id => {
            if (id !== undefined && id !== null) {
                ids.add(id);
            }
        });
        return Array.from(ids);
    }, [ligueIds]);

    // Charger les logos de manière asynchrone
    useEffect(() => {
        if (validIds.length === 0) return;

        // Filtrer les IDs qui ne sont pas déjà chargés ou en cours de chargement
        const idsToLoad = validIds.filter(id => !loadedRef.current.has(id) && !loadingRef.current.has(id));
        
        if (idsToLoad.length === 0) return;

        // Marquer comme en cours de chargement
        idsToLoad.forEach(id => loadingRef.current.add(id));
        setLoadingLogos(new Set(loadingRef.current));

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

        fetch('/dashboard/api/ligues/logos', {
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
                // Marquer comme chargés
                idsToLoad.forEach(id => {
                    loadedRef.current.add(id);
                    loadingRef.current.delete(id);
                });
                setLoadingLogos(new Set(loadingRef.current));
                setLogosCache(prev => ({ ...prev, ...data }));
            })
            .catch(error => {
                console.error('Erreur lors du chargement des logos de ligues:', error);
                // En cas d'erreur, retirer du loading
                idsToLoad.forEach(id => loadingRef.current.delete(id));
                setLoadingLogos(new Set(loadingRef.current));
            });
    }, [validIds]);

    /**
     * Fonction helper pour obtenir le logo d'une ligue
     * @param ligueId - ID de la ligue
     * @param fallbackLogo - Logo déjà fourni (prioritaire)
     * @returns Le logo en base64 ou undefined si pas d'image
     */
    const getLogo = (ligueId: number | undefined, fallbackLogo?: string | null): string | undefined => {
        // Vérifier si le fallback est une chaîne non vide (pas null, pas undefined, pas vide)
        if (fallbackLogo && typeof fallbackLogo === 'string' && fallbackLogo.trim().length > 0) {
            return fallbackLogo;
        }
        // Vérifier le cache avec une chaîne non vide (pas null, pas undefined, pas vide)
        if (ligueId && logosCache[ligueId] && typeof logosCache[ligueId] === 'string' && logosCache[ligueId].trim().length > 0) {
            return logosCache[ligueId];
        }
        return undefined;
    };

    return { getLogo, isLoading: loadingLogos.size > 0 };
}

