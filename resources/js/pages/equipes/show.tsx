import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import EquipeLogo from '@/components/equipe-logo';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/equipes' },
];

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
}

export default function EquipesShow({ equipe }: { equipe: Equipe }) {
    const breadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbsBase,
        { title: equipe.nom, href: `/equipes/${equipe.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={equipe.nom} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{equipe.nom}</h1>
                    <Link href={`/equipes/${equipe.id}/edit`} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700">Modifier</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6 flex items-center gap-6">
                    <EquipeLogo 
                        equipeId={equipe.id} 
                        logo={equipe.logo}
                        nom={equipe.nom}
                        size="xl"
                    />
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Nom</p>
                        <p className="text-lg text-gray-900 dark:text-gray-100">{equipe.nom}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


