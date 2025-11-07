import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Postes', href: '/dashboard/postes' },
    { title: 'Créer', href: '/dashboard/postes/create' },
];

export default function PostesCreate() {
    const { data, setData, post, processing, errors } = useForm({ nom: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/postes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer un Poste" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Poste</h1>
                        <p className="text-gray-600 dark:text-gray-400">Renseignez le nom du poste</p>
                    </div>
                    <Link href="/dashboard/postes" className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150">Retour</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                                <input id="nom" type="text" value={data.nom} onChange={(e) => setData('nom', e.target.value)} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                                {errors.nom && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link href="/dashboard/postes" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</Link>
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{processing ? 'Création…' : 'Créer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


