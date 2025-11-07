import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

export function useToast() {
    const { flash } = usePage<SharedData>().props;
    const prevFlashRef = useRef<{ success?: string | null; error?: string | null } | null>(null);

    useEffect(() => {
        // Afficher les messages flash uniquement s'ils ont changé
        if (flash?.success && flash.success !== prevFlashRef.current?.success) {
            toast.success(flash.success);
        }
        if (flash?.error && flash.error !== prevFlashRef.current?.error) {
            toast.error(flash.error);
        }
        
        // Mettre à jour la référence
        prevFlashRef.current = flash || null;
    }, [flash?.success, flash?.error]);
}

