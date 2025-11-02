import { useEquipeLogos } from '@/hooks/use-equipe-logos';
import { cn } from '@/lib/utils';

interface EquipeLogoProps {
    equipeId?: number;
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
    xl: 'h-24 w-24',
};

/**
 * Composant pour afficher le logo d'une équipe avec chargement asynchrone
 */
export default function EquipeLogo({ 
    equipeId, 
    logo, 
    nom, 
    className = '',
    size = 'md',
    showPlaceholder = true 
}: EquipeLogoProps) {
    const { getLogo } = useEquipeLogos(equipeId ? [equipeId] : []);
    const logoUrl = getLogo(equipeId, logo);

    if (logoUrl) {
        return (
            <img 
                src={logoUrl} 
                alt={nom || `Logo équipe ${equipeId}`} 
                className={cn('inline-block rounded object-cover', sizeClasses[size], className)}
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

