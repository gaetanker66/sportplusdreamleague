import { Head } from '@inertiajs/react';
import PublicHeader from '@/components/PublicHeader';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Head title="Accueil" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
                <p className="text-gray-600 dark:text-gray-400">Explorez le menu ci-dessus pour accéder aux sections publiques du site.</p>
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">© {new Date().getFullYear()} SPDL</footer>
        </div>
    );
}


