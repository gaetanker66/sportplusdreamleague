import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Modèles de Coupe',
        href: '/dashboard/coupe-modeles',
    },
    {
        title: 'Modifier',
        href: '/dashboard/coupe-modeles/edit',
    },
];

interface CoupeModele {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    actif: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    modele: CoupeModele;
}

export default function CoupeModeleEdit({ modele }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nom: modele.nom,
        logo: modele.logo || '',
        description: modele.description || '',
        actif: modele.actif,
    });

    const [logoPreview, setLogoPreview] = React.useState<string>(modele.logo || '');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setData('logo', result);
                setLogoPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/coupe-modeles/${modele.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${modele.nom}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Modèle</h1>
                        <p className="text-gray-600 dark:text-gray-400">Modifiez les informations du modèle "{modele.nom}"</p>
                    </div>
                    <Link
                        href="/dashboard/coupe-modeles"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Retour
                    </Link>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom du modèle *
                                    </label>
                                    <input
                                        type="text"
                                        id="nom"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ex: Coupe du Monde, Champions League..."
                                        required
                                    />
                                    {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Description du modèle de coupe..."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div>
                                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Logo (optionnel)
                                    </label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <input
                                            type="file"
                                            id="logo"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                        />
                                        {logoPreview && (
                                            <img 
                                                src={logoPreview} 
                                                alt="Aperçu du logo"
                                                className="w-16 h-16 object-contain border border-gray-300 dark:border-gray-600 rounded"
                                            />
                                        )}
                                    </div>
                                    {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={data.actif}
                                        onChange={(e) => setData('actif', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <label htmlFor="actif" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        Modèle actif (disponible pour les nouvelles coupes)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <Link
                                href="/dashboard/coupe-modeles"
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Mise à jour...' : 'Mettre à jour'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
