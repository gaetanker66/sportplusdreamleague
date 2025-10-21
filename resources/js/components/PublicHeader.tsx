import { Link } from '@inertiajs/react';

export default function PublicHeader() {
    return (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur sticky top-0 z-10">
            <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="font-extrabold tracking-tight text-xl">Sport Plus Dream League</div>
                <nav className="flex items-center gap-3 sm:gap-5 text-sm flex-wrap justify-center">
                    <Link href="/" className="hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Accueil</Link>
                    <Link href="/classement" className="hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Classement</Link>
                    <Link href="/statistiques" className="hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Statistiques</Link>
                    <Link href="/calendrier" className="hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Calendrier</Link>
                    <Link href="/tournois" className="hover:text-indigo-600 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Tournois</Link>
                </nav>
            </div>
        </header>
    );
}
