import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transferts', href: '/dashboard/transferts' },
];

interface Joueur {
    id: number;
    nom: string;
}

interface Equipe {
    id: number;
    nom: string;
}

interface Transfert {
    id: number;
    joueur: Joueur;
    ancienne_equipe_id: number;
    nouvelle_equipe_id: number;
    date_transfert: string;
    ancienne_equipe?: Equipe;
    nouvelle_equipe?: Equipe;
}

export default function TransfertsIndex({ transferts = [] }: { transferts: Transfert[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce transfert ?')) router.delete(`/dashboard/transferts/${id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Transferts" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Transferts</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez et gérez les transferts de joueurs</p>
                    </div>
                    <Link href="/dashboard/transferts/create" className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">+ Nouveau Transfert</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    {transferts.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joueur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ancienne Équipe</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nouvelle Équipe</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {transferts.map((transfert) => (
                                        <tr key={transfert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{transfert.joueur?.nom || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{transfert.ancienne_equipe?.nom || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{transfert.nouvelle_equipe?.nom || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatDate(transfert.date_transfert)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/transferts/${transfert.id}/edit`} className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700">Modifier</Link>
                                                    <button onClick={() => handleDelete(transfert.id)} className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700">Supprimer</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucun transfert</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer un transfert.</p>
                            <div className="mt-6">
                                <Link href="/dashboard/transferts/create" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Nouveau Transfert</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

