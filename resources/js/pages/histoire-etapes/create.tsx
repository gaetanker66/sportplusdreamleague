import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: "Histoire", href: '/dashboard/histoire-etapes' },
    { title: 'Créer', href: '/dashboard/histoire-etapes/create' },
];

export default function HistoireEtapesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        titre: '',
        date_label: '',
        date: '',
        description: '',
        image: '',
        ordre: 0,
        actif: true,
    });

    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setData('image', result);
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/histoire-etapes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une Étape" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Étape</h1>
                        <p className="text-gray-600 dark:text-gray-400">Renseignez les informations de l'étape</p>
                    </div>
                    <Link 
                        href="/dashboard/histoire-etapes" 
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Titre *
                                </label>
                                <input
                                    id="titre"
                                    type="text"
                                    value={data.titre}
                                    onChange={(e) => setData('titre', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.titre && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.titre}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date_label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Label de date (ex: "2022", "Avant 2022")
                                    </label>
                                    <input
                                        id="date_label"
                                        type="text"
                                        value={data.date_label}
                                        onChange={(e) => setData('date_label', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.date_label && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date_label}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date réelle (pour le tri)
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.date && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Image
                                </label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Aperçu"
                                            className="h-32 w-auto object-cover rounded-md"
                                        />
                                    </div>
                                )}
                                {errors.image && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ordre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        id="ordre"
                                        type="number"
                                        min="0"
                                        value={data.ordre}
                                        onChange={(e) => setData('ordre', parseInt(e.target.value) || 0)}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors.ordre && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.ordre}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={data.actif}
                                            onChange={(e) => setData('actif', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Actif (afficher cette étape)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link 
                                    href="/dashboard/histoire-etapes" 
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

