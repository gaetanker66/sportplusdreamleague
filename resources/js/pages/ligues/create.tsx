import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ligues',
        href: '/dashboard/ligues',
    },
    {
        title: 'Créer',
        href: '/dashboard/ligues/create',
    },
];

export default function LiguesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        logo: '',
        niveau: 1,
        nombre_equipes: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/ligues');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer une ligue" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer une nouvelle ligue</h1>
                        <p className="text-gray-600 dark:text-gray-400">Remplissez les informations de votre ligue</p>
                    </div>
                    <Link
                        href="/dashboard/ligues"
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
                                    Nom de la ligue *
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

                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Logo
                                </label>
                                <input
                                    type="file"
                                    id="logo"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setData('logo', event.target?.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {data.logo && (
                                    <div className="mt-2">
                                        <img
                                            src={data.logo}
                                            alt="Aperçu du logo"
                                            className="h-20 w-20 object-cover rounded-md"
                                        />
                                    </div>
                                )}
                                {errors.logo && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Niveau *
                                </label>
                                <input
                                    type="number"
                                    id="niveau"
                                    value={data.niveau}
                                    onChange={(e) => setData('niveau', parseInt(e.target.value))}
                                    min="1"
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.niveau && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.niveau}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="nombre_equipes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre d'équipes *
                                </label>
                                <input
                                    type="number"
                                    id="nombre_equipes"
                                    value={data.nombre_equipes}
                                    onChange={(e) => setData('nombre_equipes', parseInt(e.target.value))}
                                    min="0"
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.nombre_equipes && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombre_equipes}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <Link
                                    href="/dashboard/ligues"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Création...
                                        </>
                                    ) : (
                                        'Créer la ligue'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
