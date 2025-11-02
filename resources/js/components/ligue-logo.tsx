import { useLigueLogos } from '@/hooks/use-ligue-logos';
import { cn } from '@/lib/utils';

interface LigueLogoProps {
    ligueId?: number;
    logo?: string | null;
    nom?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showPlaceholder?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
    xl: 'h-24 w-24',
    full: 'w-full h-64',
};

/**
 * Composant pour afficher le logo d'une ligue avec chargement asynchrone
 */
export default function LigueLogo({ 
    ligueId, 
    logo, 
    nom, 
    className = '',
    size = 'md',
    showPlaceholder = true 
}: LigueLogoProps) {
    const { getLogo } = useLigueLogos(ligueId ? [ligueId] : []);
    const logoUrl = getLogo(ligueId, logo);

    // Vérifier que logoUrl est une chaîne non vide (pas null, pas undefined, pas vide)
    if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) {
        return (
            <img 
                src={logoUrl} 
                alt={nom || `Logo ligue ${ligueId}`} 
                className={cn('inline-block rounded', sizeClasses[size], className)}
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
            <div 
                className={cn(
                    'rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
                    sizeClasses[size],
                    className
                )}
            >
                <span className="text-gray-400 text-lg">Aucun logo</span>
            </div>
        );
    }

    return null;
}

