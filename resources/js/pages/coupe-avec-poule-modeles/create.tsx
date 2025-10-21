import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

export default function CoupeAvecPouleModeleCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        logo: '',
        description: '',
        nombre_equipes: 8,
        nombre_poules: 2,
        qualifies_par_poule: 2,
        actif: true,
    });

    const [logoPreview, setLogoPreview] = React.useState<string>('');

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

    const equipesParPoule = data.nombre_equipes / data.nombre_poules;
    const isValidConfiguration = data.nombre_equipes % data.nombre_poules === 0 && 
                                data.nombre_equipes >= data.nombre_poules * 2;

    return (
        <AppLayout>
            <Head title="Créer un Modèle de Coupe avec Poules" />
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Modèle de Coupe avec Poules</h1>
                    <Link 
                        href="/coupe-avec-poule-modeles" 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); post('/coupe-avec-poule-modeles'); }} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom du modèle
                                </label>
                                <input
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ex: Ligue des Champions"
                                />
                                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Logo (optionnel)
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                    />
                                    {logoPreview && (
                                        <img 
                                            src={logoPreview} 
                                            alt="Preview" 
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    )}
                                </div>
                                {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Description du modèle..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nombre d'équipes
                                    </label>
                                    <input
                                        type="number"
                                        min="4"
                                        step="2"
                                        value={data.nombre_equipes}
                                        onChange={(e) => setData('nombre_equipes', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.nombre_equipes && <p className="mt-1 text-sm text-red-600">{errors.nombre_equipes}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nombre de poules
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        value={data.nombre_poules}
                                        onChange={(e) => setData('nombre_poules', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.nombre_poules && <p className="mt-1 text-sm text-red-600">{errors.nombre_poules}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Qualifiés par poule
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={equipesParPoule}
                                        value={data.qualifies_par_poule}
                                        onChange={(e) => setData('qualifies_par_poule', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.qualifies_par_poule && <p className="mt-1 text-sm text-red-600">{errors.qualifies_par_poule}</p>}
                                </div>
                            </div>

                            {!isValidConfiguration && (
                                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Configuration invalide : Le nombre d'équipes doit être divisible par le nombre de poules.
                                        Chaque poule doit avoir au moins 2 équipes.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="actif"
                                    checked={data.actif}
                                    onChange={(e) => setData('actif', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="actif" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Modèle actif
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !isValidConfiguration}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Création...' : 'Créer le modèle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
