import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { TomSelectMulti } from '@/components/tomselect';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useMemo, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Actualités', href: '/dashboard/actualites' },
    { title: 'Créer', href: '/dashboard/actualites/create' },
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

interface Props {
    equipes?: Equipe[];
    joueurs?: Joueur[];
}

export default function ActualitesCreate({ equipes = [], joueurs = [] }: Props) {
    const renderStart = performance.now();
    const renderCountRef = useRef(0);
    
    const { data, setData, post, processing, errors } = useForm({
        type: 'rumeur' as 'rumeur' | 'transfert',
        contenu: '',
        date: new Date().toISOString().split('T')[0],
        equipes: [] as number[],
        joueurs: [] as number[],
    });

    // Mémoriser les options pour éviter les recalculs à chaque render
    const equipeOptions = useMemo(() => {
        const start = performance.now();
        const options = equipes.map(e => ({ value: e.id, label: e.nom }));
        console.log(`[ActualitesCreate] equipeOptions useMemo: ${(performance.now() - start).toFixed(2)}ms (${equipes.length} équipes)`);
        return options;
    }, [equipes]);

    const joueurOptions = useMemo(() => {
        const start = performance.now();
        const options = joueurs.map(j => ({ 
            value: j.id, 
            label: `${j.nom}${j.equipe ? ` (${j.equipe.nom})` : ''}` 
        }));
        console.log(`[ActualitesCreate] joueurOptions useMemo: ${(performance.now() - start).toFixed(2)}ms (${joueurs.length} joueurs)`);
        return options;
    }, [joueurs]);

    renderCountRef.current += 1;
    console.log(`[ActualitesCreate] Render #${renderCountRef.current} total: ${(performance.now() - renderStart).toFixed(2)}ms`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/actualites');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une Actualité" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Actualité</h1>
                        <p className="text-gray-600 dark:text-gray-400">Créez une nouvelle actualité</p>
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
                                    options={equipeOptions}
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
                                    options={joueurOptions}
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

