import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { TomSelectMulti } from '@/components/tomselect';
import { RichTextEditor } from '@/components/rich-text-editor';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Actualités', href: '/dashboard/actualites' },
    { title: 'Modifier', href: '/dashboard/actualites/edit' },
];

interface Equipe {
    id: number;
    nom: string;
}

interface Joueur {
    id: number;
    nom: string;
    equipe?: {
        id: number;
        nom: string;
    };
}

interface Actualite {
    id: number;
    type: 'rumeur' | 'transfert';
    contenu: string;
    date: string;
    equipes?: Equipe[];
    joueurs?: Joueur[];
}

interface Props {
    actualite: Actualite;
    equipes?: Equipe[];
    joueurs?: Joueur[];
}

export default function ActualitesEdit({ actualite, equipes = [], joueurs = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        type: actualite.type,
        contenu: actualite.contenu,
        date: actualite.date.split('T')[0],
        equipes: (actualite.equipes || []).map(e => e.id),
        joueurs: (actualite.joueurs || []).map(j => j.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/actualites/${actualite.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier une Actualité" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier l'Actualité</h1>
                        <p className="text-gray-600 dark:text-gray-400">Modifiez les informations de l'actualité</p>
                    </div>
                    <Link 
                        href="/dashboard/actualites" 
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type *
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value as 'rumeur' | 'transfert')}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="rumeur">Rumeur</option>
                                    <option value="transfert">Transfert</option>
                                </select>
                                {errors.type && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.type}</p>}
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date *
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.date && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
                            </div>

                            <div>
                                <label htmlFor="equipes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Équipes concernées
                                </label>
                                <TomSelectMulti
                                    options={equipes.map(e => ({ value: e.id, label: e.nom }))}
                                    values={data.equipes}
                                    placeholder="Sélectionnez une ou plusieurs équipes"
                                    onChange={(vals) => setData('equipes', vals)}
                                />
                                {errors.equipes && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.equipes}</p>}
                            </div>

                            <div>
                                <label htmlFor="joueurs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Joueurs concernés
                                </label>
                                <TomSelectMulti
                                    options={joueurs.map(j => ({ 
                                        value: j.id, 
                                        label: `${j.nom}${j.equipe ? ` (${j.equipe.nom})` : ''}` 
                                    }))}
                                    values={data.joueurs}
                                    placeholder="Sélectionnez un ou plusieurs joueurs"
                                    onChange={(vals) => setData('joueurs', vals)}
                                />
                                {errors.joueurs && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.joueurs}</p>}
                            </div>

                            <div>
                                <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contenu *
                                </label>
                                <div className="mt-1">
                                    <RichTextEditor
                                        value={data.contenu}
                                        onChange={(value) => setData('contenu', value)}
                                        placeholder="Saisissez le contenu de l'actualité..."
                                    />
                                </div>
                                {errors.contenu && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.contenu}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link 
                                    href="/dashboard/actualites" 
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Mise à jour…' : 'Mettre à jour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

