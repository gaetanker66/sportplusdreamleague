import { Link } from '@inertiajs/react';
import logo from '../../images/logo.avif';
import AppearanceToggleDropdown from './appearance-dropdown';

export default function PublicHeader() {
    return (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur sticky top-0 z-10">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img 
                        src={logo} 
                        alt="Sport Plus Dream League" 
                        className="h-[60px] w-[120px] object-contain"
                    />
                    <div className="font-extrabold tracking-tight text-xl">Sport Plus Dream League</div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
                <nav className="flex items-center gap-2 sm:gap-4 lg:gap-5 text-sm flex-wrap sm:flex-nowrap justify-center">
                    <Link href="/" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Accueil</Link>
                    <a 
                        href="https://sportplusdreamleague.wixsite.com/sportplus/blog" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
                    >
                        Actu
                    </a>
                    <Link href="/equipes" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Équipes</Link>
                    <Link href="/classement" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Classement</Link>
                    <Link href="/statistiques" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Statistiques</Link>
                    <Link href="/calendrier" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Calendrier</Link>
                    <Link href="/tournois" className="hover:text-white px-2 py-1 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">Tournois</Link>
                    <a 
                        href="https://www.youtube.com/channel/UCOxEYziBAz-L-O0ELeBL48A" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white px-2 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        aria-label="YouTube"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    </a>
                    <a 
                        href="https://x.com/PhoenixSeven7" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white px-2 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        aria-label="X (Twitter)"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </nav>
                <AppearanceToggleDropdown />
                </div>
            </div>
        </header>
    );
}
