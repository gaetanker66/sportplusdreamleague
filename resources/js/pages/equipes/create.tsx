import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';
import { TomSelectMulti } from '@/components/tomselect';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/dashboard/equipes' },
    { title: 'Créer', href: '/dashboard/equipes/create' },
];

interface Equipe {
    id: number;
    nom: string;
}

interface Props {
    equipes?: Equipe[];
}

export default function EquipesCreate({ equipes = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        logo: '',
        description: '',
        maillot_domicile: '',
        maillot_exterieur: '',
        maillot_3eme: '',
        rivales: [] as number[],
    });

    const [maillotDomicilePreview, setMaillotDomicilePreview] = React.useState<string>('');
    const [maillotExterieurPreview, setMaillotExterieurPreview] = React.useState<string>('');
    const [maillot3emePreview, setMaillot3emePreview] = React.useState<string>('');

    const handleMaillotDomicileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setData('maillot_domicile', result);
                setMaillotDomicilePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMaillotExterieurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setData('maillot_exterieur', result);
                setMaillotExterieurPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMaillot3emeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setData('maillot_3eme', result);
                setMaillot3emePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/equipes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une Équipe" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Équipe</h1>
                        <p className="text-gray-600 dark:text-gray-400">Renseignez les informations de l'équipe</p>
                    </div>
                    <Link href="/dashboard/equipes" className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                                <input
                                    id="nom"
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.nom && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="rivales" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipes rivales</label>
                                <TomSelectMulti
                                    options={equipes.map(e => ({ value: e.id, label: e.nom }))}
                                    values={data.rivales}
                                    placeholder="Sélectionnez une ou plusieurs équipes rivales"
                                    onChange={(vals) => setData('rivales', vals)}
                                />
                                {errors.rivales && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.rivales}</p>}
                            </div>

                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => setData('logo', event.target?.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {data.logo && (
                                    <img src={data.logo} alt="Aperçu du logo" className="mt-2 h-16 w-16 rounded object-cover" />
                                )}
                                {errors.logo && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>}
                            </div>

                            <div>
                                <label htmlFor="maillot_domicile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maillot domicile (optionnel)</label>
                                <input
                                    id="maillot_domicile"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMaillotDomicileChange}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {maillotDomicilePreview && (
                                    <img src={maillotDomicilePreview} alt="Aperçu maillot domicile" className="mt-2 h-32 w-auto rounded object-contain" />
                                )}
                                {errors.maillot_domicile && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.maillot_domicile}</p>}
                            </div>

                            <div>
                                <label htmlFor="maillot_exterieur" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maillot extérieur (optionnel)</label>
                                <input
                                    id="maillot_exterieur"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMaillotExterieurChange}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {maillotExterieurPreview && (
                                    <img src={maillotExterieurPreview} alt="Aperçu maillot extérieur" className="mt-2 h-32 w-auto rounded object-contain" />
                                )}
                                {errors.maillot_exterieur && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.maillot_exterieur}</p>}
                            </div>

                            <div>
                                <label htmlFor="maillot_3eme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maillot 3ème (optionnel)</label>
                                <input
                                    id="maillot_3eme"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMaillot3emeChange}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {maillot3emePreview && (
                                    <img src={maillot3emePreview} alt="Aperçu maillot 3ème" className="mt-2 h-32 w-auto rounded object-contain" />
                                )}
                                {errors.maillot_3eme && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.maillot_3eme}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link href="/dashboard/equipes" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</Link>
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
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


