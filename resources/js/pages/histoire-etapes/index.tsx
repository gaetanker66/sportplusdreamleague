import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: "Histoire", href: '/dashboard/histoire-etapes' },
];

interface HistoireEtape {
    id: number;
    titre: string;
    date_label?: string | null;
    date?: string | null;
    description?: string | null;
    image?: string | null;
    ordre: number;
    actif: boolean;
    created_at: string;
    updated_at: string;
}

export default function HistoireEtapesIndex({ etapes = [] }: { etapes: HistoireEtape[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
            router.delete(`/dashboard/histoire-etapes/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion de l'Histoire" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion de l'Histoire</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez et gérez les étapes de l'histoire</p>
                    </div>
                    <Link 
                        href="/dashboard/histoire-etapes/create" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        + Nouvelle Étape
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    {etapes.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ordre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actif</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {etapes.map((etape) => (
                                        <tr key={etape.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{etape.ordre}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{etape.titre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {etape.date_label || (etape.date ? new Date(etape.date).toLocaleDateString('fr-FR') : '-')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {etape.image ? (
                                                    <img 
                                                        src={etape.image} 
                                                        alt={etape.titre}
                                                        className="h-12 w-12 object-cover rounded"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    etape.actif 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}>
                                                    {etape.actif ? 'Oui' : 'Non'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Link 
                                                        href={`/dashboard/histoire-etapes/${etape.id}/edit`} 
                                                        className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Modifier
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(etape.id)} 
                                                        className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucune étape</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer une étape.</p>
                            <div className="mt-6">
                                <Link 
                                    href="/dashboard/histoire-etapes/create" 
                                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Nouvelle Étape
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

