import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';
// Liste en tableau plutôt qu'un gros TomSelect
import { TomSelectSingle as TomSingle } from '@/components/tomselect';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Saisons',
        href: '/dashboard/saisons',
    },
    {
        title: 'Créer',
        href: '/dashboard/saisons/create',
    },
];

interface Ligue {
    id: number;
    nom: string;
    nombre_equipes: number;
}
interface Equipe { id: number; nom: string }

interface Props { ligues: Ligue[]; equipes: Equipe[]; suggestedEquipeIds?: number[] }

export default function SaisonsCreate({ ligues, equipes, suggestedEquipeIds = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        date_debut: '',
        date_fin: '',
        status: 'en cours' as 'en cours' | 'terminé',
        ligue_id: ligues?.[0]?.id ?? 0,
        nombre_equipes: ligues?.[0]?.nombre_equipes ?? 0,
        equipes: suggestedEquipeIds.length ? suggestedEquipeIds : ([] as number[]),
    });

    const [addSelection, setAddSelection] = React.useState<number | ''>('');
    const notSelectedOptions = React.useMemo(() => (
        equipes.filter(e => !data.equipes.includes(e.id)).map(e => ({ value: e.id, label: e.nom }))
    ), [equipes, data.equipes]);

    const toggleEquipe = (id: number) => {
        const exists = data.equipes.includes(id);
        if (exists) {
            setData('equipes', data.equipes.filter(eid => eid !== id));
        } else {
            if (data.equipes.length >= (data.nombre_equipes || 0)) return; // ne pas dépasser
            setData('equipes', [...data.equipes, id]);
        }
    };
    const handleAddEquipe = () => {
        if (!addSelection) return;
        toggleEquipe(Number(addSelection));
        setAddSelection('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/saisons');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une Saison" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Saison</h1>
                        <p className="text-gray-600 dark:text-gray-400">Renseignez les informations de la saison</p>
                    </div>
                    <Link
                        href="/dashboard/saisons"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom de la saison *
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.nom && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date de début *
                                    </label>
                                    <input
                                        type="date"
                                        id="date_debut"
                                        value={data.date_debut}
                                        onChange={(e) => setData('date_debut', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.date_debut && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date_debut}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        id="date_fin"
                                        value={data.date_fin}
                                        onChange={(e) => setData('date_fin', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.date_fin && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date_fin}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Statut *
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'en cours' | 'terminé')}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="en cours">En cours</option>
                                        <option value="terminé">Terminé</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="ligue_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ligue *
                                    </label>
                                    <select
                                        id="ligue_id"
                                        value={data.ligue_id}
                                        onChange={(e) => {
                                            const id = parseInt(e.target.value);
                                            setData('ligue_id', id);
                                            const ligue = ligues.find(l => l.id === id);
                                            if (ligue) setData('nombre_equipes', ligue.nombre_equipes || 0);
                                        }}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    >
                                        {ligues?.map((ligue) => (
                                            <option key={ligue.id} value={ligue.id}>{ligue.nom}</option>
                                        ))}
                                    </select>
                                    {errors.ligue_id && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.ligue_id}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="nombre_equipes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre d'équipes *
                                </label>
                                <input
                                    type="number"
                                    id="nombre_equipes"
                                    min="0"
                                    value={data.nombre_equipes}
                                    onChange={(e) => setData('nombre_equipes', parseInt(e.target.value))}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.nombre_equipes && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombre_equipes}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipes de la saison</label>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {data.equipes.length}/{data.nombre_equipes || 0} sélectionnées
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 mb-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Ajouter une équipe</label>
                                        <TomSingle
                                            options={notSelectedOptions}
                                            value={addSelection}
                                            onChange={(val) => setAddSelection(val ? Number(val) : '')}
                                            allowEmpty
                                            placeholder="Rechercher/choisir une équipe à ajouter"
                                        />
                                    </div>
                                    <button type="button" onClick={handleAddEquipe} disabled={!addSelection || data.equipes.length >= (data.nombre_equipes || 0)} className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Ajouter</button>
                                </div>
                                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {data.equipes.map((id) => {
                                                const e = equipes.find(eq => eq.id === id);
                                                if (!e) return null;
                                                return (
                                                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-4 py-2">
                                                            { (e as any).logo ? <img src={(e as any).logo} alt={e.nom} className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" /> }
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{e.nom}</td>
                                                        <td className="px-4 py-2">
                                                            <button type="button" onClick={() => toggleEquipe(id)} className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700">Retirer</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {errors.equipes && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{(errors as any).equipes}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <Link
                                    href="/dashboard/saisons"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Création…' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


