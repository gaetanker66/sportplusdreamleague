import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import EquipeLogo from '@/components/equipe-logo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/equipes' },
];

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
    created_at: string;
    updated_at: string;
}

export default function EquipesIndex({ equipes = [] as Equipe[] }: { equipes: Equipe[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette équipe ?')) router.delete(`/equipes/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Équipes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Équipes</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez et gérez vos équipes</p>
                    </div>
                    <Link href="/equipes/create" className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        + Nouvelle Équipe
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    {equipes.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {equipes.map((equipe) => (
                                        <tr key={equipe.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EquipeLogo 
                                                    equipeId={equipe.id} 
                                                    logo={equipe.logo}
                                                    nom={equipe.nom}
                                                    size="lg"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{equipe.nom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Link href={`/equipes/${equipe.id}`} className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700">Voir</Link>
                                                    <Link href={`/equipes/${equipe.id}/edit`} className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700">Modifier</Link>
                                                    <button onClick={() => handleDelete(equipe.id)} className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700">Supprimer</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucune équipe</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer une nouvelle équipe.</p>
                            <div className="mt-6">
                                <Link href="/equipes/create" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Nouvelle Équipe</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


