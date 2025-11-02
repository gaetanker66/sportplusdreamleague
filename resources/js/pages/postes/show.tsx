import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Postes', href: '/postes' },
];

interface Poste { id: number; nom: string; }

export default function PostesShow({ poste }: { poste: Poste }) {
    const breadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbsBase,
        { title: poste.nom, href: `/postes/${poste.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={poste.nom} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{poste.nom}</h1>
                    <Link href={`/postes/${poste.id}/edit`} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Modifier</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6">
                    <p className="text-gray-600 dark:text-gray-400">Nom</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{poste.nom}</p>
                </div>
            </div>
        </AppLayout>
    );
}


