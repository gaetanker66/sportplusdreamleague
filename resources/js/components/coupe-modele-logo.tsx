import { useCoupeModeleLogos } from '@/hooks/use-coupe-modele-logos';
import { cn } from '@/lib/utils';

interface CoupeModeleLogoProps {
    modeleId?: number;
    logo?: string | null;
    nom?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showPlaceholder?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
};

/**
 * Composant pour afficher le logo d'un modèle de coupe avec chargement asynchrone
 */
export default function CoupeModeleLogo({ 
    modeleId, 
    logo, 
    nom, 
    className = '',
    size = 'md',
    showPlaceholder = true 
}: CoupeModeleLogoProps) {
    const { getLogo } = useCoupeModeleLogos(modeleId ? [modeleId] : []);
    const logoUrl = getLogo(modeleId, logo);

    // Vérifier que logoUrl est une chaîne non vide (pas null, pas undefined, pas vide)
    if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) {
        return (
            <img 
                src={logoUrl} 
                alt={nom || `Logo modèle ${modeleId}`} 
                className={cn('inline-block rounded object-contain', sizeClasses[size], className)}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline-block';
                    }
                }}
            />
        );
    }

    if (showPlaceholder) {
        return (
            <span 
                className={cn(
                    'inline-block rounded bg-gray-200 dark:bg-gray-700',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return null;
}

