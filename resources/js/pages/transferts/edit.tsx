import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transferts', href: '/dashboard/transferts' },
    { title: 'Modifier', href: '#' },
];

interface Joueur {
    id: number;
    nom: string;
    equipe?: {
        id: number;
        nom: string;
    };
}

interface Equipe {
    id: number;
    nom: string;
}

interface Transfert {
    id: number;
    joueur: Joueur;
    ancienne_equipe: Equipe;
    nouvelle_equipe: Equipe;
    date_transfert: string;
}

export default function TransfertsEdit({ transfert, joueurs = [], equipes = [] }: { transfert: Transfert; joueurs: Joueur[]; equipes: Equipe[] }) {
    const { data, setData, put, processing, errors } = useForm({
        joueur_id: transfert.joueur.id.toString(),
        nouvelle_equipe_id: transfert.nouvelle_equipe.id.toString(),
        date_transfert: transfert.date_transfert.split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/transferts/${transfert.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier un Transfert" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Transfert</h1>
                        <p className="text-gray-600 dark:text-gray-400">Modifiez les informations du transfert</p>
                    </div>
                    <Link href="/dashboard/transferts" className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150">Retour</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="joueur_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joueur *</label>
                                <select
                                    id="joueur_id"
                                    value={data.joueur_id}
                                    onChange={(e) => setData('joueur_id', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    disabled
                                >
                                    <option value={transfert.joueur.id}>{transfert.joueur.nom}</option>
                                </select>
                                {errors.joueur_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.joueur_id}</p>}
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">Note:</span> Il n'est pas possible de changer le joueur d'un transfert existant.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="ancienne_equipe" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ancienne Équipe</label>
                                <input
                                    id="ancienne_equipe"
                                    type="text"
                                    value={transfert.ancienne_equipe?.nom || '-'}
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm sm:text-sm opacity-60"
                                />
                            </div>

                            <div>
                                <label htmlFor="nouvelle_equipe_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nouvelle Équipe *</label>
                                <select
                                    id="nouvelle_equipe_id"
                                    value={data.nouvelle_equipe_id}
                                    onChange={(e) => setData('nouvelle_equipe_id', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    {equipes.map((equipe) => (
                                        <option key={equipe.id} value={equipe.id}>
                                            {equipe.nom}
                                        </option>
                                    ))}
                                </select>
                                {errors.nouvelle_equipe_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nouvelle_equipe_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="date_transfert" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date du Transfert *</label>
                                <input
                                    id="date_transfert"
                                    type="date"
                                    value={data.date_transfert}
                                    onChange={(e) => setData('date_transfert', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.date_transfert && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date_transfert}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link href="/dashboard/transferts" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</Link>
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{processing ? 'Mise à jour…' : 'Mettre à jour'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

