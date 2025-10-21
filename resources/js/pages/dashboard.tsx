import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sport Plus Dream League</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gérez votre ligue de sport de rêve</p>
                </div>
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link 
                        href="/ligues" 
                        className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 p-6 flex flex-col justify-center items-center text-center"
                    >
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestion des Ligues</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Créez et gérez vos ligues</p>
                    </Link>
                    
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 p-6 flex flex-col justify-center items-center text-center">
                        <div className="text-4xl mb-4">⚽</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Équipes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bientôt disponible</p>
                    </div>
                    
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 p-6 flex flex-col justify-center items-center text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Statistiques</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bientôt disponible</p>
                    </div>
                </div>
                
                <div className="relative min-h-[200px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Link 
                            href="/ligues/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <div className="text-2xl mr-3">➕</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouvelle Ligue</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle ligue</div>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/ligues" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <div className="text-2xl mr-3">📋</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Voir toutes les ligues</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Gérer vos ligues existantes</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
