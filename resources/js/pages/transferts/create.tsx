import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transferts', href: '/transferts' },
    { title: 'Créer', href: '/transferts/create' },
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

export default function TransfertsCreate({ joueurs = [], equipes = [] }: { joueurs: Joueur[]; equipes: Equipe[] }) {
    const { data, setData, post, processing, errors } = useForm({
        joueur_id: '',
        nouvelle_equipe_id: '',
        date_transfert: new Date().toISOString().split('T')[0],
    });

    const selectedJoueur = React.useMemo(() => {
        return joueurs.find(j => j.id === Number(data.joueur_id));
    }, [data.joueur_id, joueurs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/transferts');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer un Transfert" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Transfert</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez un transfert de joueur</p>
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
                                    required
                                >
                                    <option value="">Sélectionnez un joueur</option>
                                    {joueurs.map((joueur) => (
                                        <option key={joueur.id} value={joueur.id}>
                                            {joueur.nom} {joueur.equipe ? `(${joueur.equipe.nom})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.joueur_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.joueur_id}</p>}
                                {selectedJoueur && selectedJoueur.equipe && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Équipe actuelle : <span className="font-semibold">{selectedJoueur.equipe.nom}</span>
                                    </p>
                                )}
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
                                    <option value="">Sélectionnez une équipe</option>
                                    {equipes
                                        .filter(equipe => !selectedJoueur || equipe.id !== selectedJoueur.equipe?.id)
                                        .map((equipe) => (
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
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{processing ? 'Création…' : 'Créer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

