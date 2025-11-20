import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Actualités', href: '/dashboard/actualites' },
];

interface Equipe {
    id: number;
    nom: string;
}

interface Joueur {
    id: number;
    nom: string;
}

interface Actualite {
    id: number;
    type: 'rumeur' | 'transfert';
    contenu: string;
    date: string;
    equipes?: Equipe[];
    joueurs?: Joueur[];
    created_at: string;
}

export default function ActualitesIndex({ actualites = [] as Actualite[] }: { actualites: Actualite[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette actualité ?')) {
            router.delete(`/dashboard/actualites/${id}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Actualités" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Actualités</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez et gérez les actualités</p>
                    </div>
                    <Link 
                        href="/dashboard/actualites/create" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        + Nouvelle Actualité
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    {actualites.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contenu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Équipes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joueurs</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {actualites.map((actualite) => (
                                        <tr key={actualite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    actualite.type === 'transfert' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {actualite.type === 'transfert' ? 'Transfert' : 'Rumeur'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {formatDate(actualite.date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                                                <div className="truncate" dangerouslySetInnerHTML={{ __html: actualite.contenu.substring(0, 100) + (actualite.contenu.length > 100 ? '...' : '') }} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {actualite.equipes && actualite.equipes.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {actualite.equipes.map((equipe) => (
                                                            <span key={equipe.id} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                                                                {equipe.nom}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {actualite.joueurs && actualite.joueurs.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {actualite.joueurs.map((joueur) => (
                                                            <span key={joueur.id} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs">
                                                                {joueur.nom}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Link 
                                                        href={`/dashboard/actualites/${actualite.id}/edit`} 
                                                        className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Modifier
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(actualite.id)} 
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucune actualité</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer une actualité.</p>
                            <div className="mt-6">
                                <Link 
                                    href="/dashboard/actualites/create" 
                                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Nouvelle Actualité
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

