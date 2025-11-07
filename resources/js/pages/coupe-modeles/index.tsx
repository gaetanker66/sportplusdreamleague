import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Modèles de Coupe',
        href: '/dashboard/coupe-modeles',
    },
];

interface CoupeModele {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    actif: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    modeles: CoupeModele[];
}

export default function CoupeModeleIndex({ modeles }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
            router.delete(`/dashboard/coupe-modeles/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modèles de Coupe" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modèles de Coupe</h1>
                        <p className="text-gray-600 dark:text-gray-400">Gérez les modèles de coupe disponibles</p>
                    </div>
                    <Link
                        href="/dashboard/coupe-modeles/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <span className="mr-2">➕</span>
                        Nouveau Modèle
                    </Link>
                </div>

                {modeles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun modèle de coupe</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Commencez par créer votre premier modèle de coupe</p>
                        <Link
                            href="/dashboard/coupe-modeles/create"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Créer un modèle
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modeles.map((modele) => (
                            <div key={modele.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {modele.logo && (
                                            <img 
                                                src={modele.logo} 
                                                alt={`Logo ${modele.nom}`}
                                                className="w-12 h-12 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {modele.nom}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    modele.actif 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {modele.actif ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {modele.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        {modele.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/dashboard/coupe-modeles/${modele.id}/edit`}
                                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        >
                                            Modifier
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(modele.id)}
                                            className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(modele.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
