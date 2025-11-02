import { useEffect, useState, useMemo } from 'react';

/**
 * Hook pour charger les logos des équipes de manière asynchrone
 * @param equipeIds - Tableau d'IDs d'équipes à charger
 * @returns Object contenant les logos chargés et une fonction helper pour obtenir un logo
 */
export function useEquipeLogos(equipeIds: (number | undefined)[]) {
    const [logosCache, setLogosCache] = useState<Record<number, string>>({});
    const [loadingLogos, setLoadingLogos] = useState<Set<number>>(new Set());

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

        // Filtrer les IDs qui ne sont pas déjà en cache et qui ne sont pas en cours de chargement
        const idsToLoad = validIds.filter(id => !logosCache[id] && !loadingLogos.has(id));
        
        if (idsToLoad.length === 0) return;

        setLoadingLogos(prev => new Set([...prev, ...idsToLoad]));

        fetch('/api/equipes/logos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ ids: idsToLoad }),
        })
            .then(response => response.json())
            .then(data => {
                setLogosCache(prev => ({ ...prev, ...data }));
            })
            .catch(error => {
                console.error('Erreur lors du chargement des logos:', error);
            })
            .finally(() => {
                setLoadingLogos(prev => {
                    const newSet = new Set(prev);
                    idsToLoad.forEach(id => newSet.delete(id));
                    return newSet;
                });
            });
    }, [validIds, logosCache, loadingLogos]);

    /**
     * Fonction helper pour obtenir le logo d'une équipe
     * @param equipeId - ID de l'équipe
     * @param fallbackLogo - Logo déjà fourni (prioritaire)
     * @returns Le logo en base64 ou undefined
     */
    const getLogo = (equipeId: number | undefined, fallbackLogo?: string | null): string | undefined => {
        if (fallbackLogo) return fallbackLogo;
        if (equipeId && logosCache[equipeId]) return logosCache[equipeId];
        return undefined;
    };

    return { getLogo, isLoading: loadingLogos.size > 0 };
}

