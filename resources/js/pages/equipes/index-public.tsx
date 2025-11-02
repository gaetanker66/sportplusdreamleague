import { Head, Link, router } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';
import EquipeLogo from '@/components/equipe-logo';
import equipeBackground from '../../../images/equipe-background.avif';

interface Ligue {
    id: number;
    nom: string;
    niveau: number;
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    created_at: string;
}

interface Props {
    ligues: Ligue[];
    equipes: Equipe[];
    equipesParLigue: { [key: number]: Equipe[] };
    selectedLigueId: number | null;
    search: string;
}

export default function EquipesIndex({ ligues = [], equipes = [], equipesParLigue = {}, selectedLigueId, search = '' }: Props) {
    const [activeTab, setActiveTab] = React.useState<number | null>(selectedLigueId);
    const [searchTerm, setSearchTerm] = React.useState(search);
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);

    // Debounce de la recherche
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Mettre à jour l'URL lors du changement d'onglet ou de recherche
    React.useEffect(() => {
        const params = new URLSearchParams();
        if (activeTab) {
            params.set('ligue_id', String(activeTab));
        }
        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        }
        const queryString = params.toString();
        const url = queryString ? `/equipes?${queryString}` : '/equipes';
        router.get(url, {}, { preserveState: true, replace: true });
    }, [activeTab, debouncedSearch]);

    // Filtrer les équipes selon l'onglet actif et la recherche
    const filteredEquipes = React.useMemo(() => {
        let result: Equipe[] = [];

        if (activeTab && equipesParLigue[activeTab]) {
            result = equipesParLigue[activeTab];
        } else if (!activeTab) {
            // Toutes les équipes
            result = equipes;
        } else {
            result = [];
        }

        // Filtrer par recherche si défini
        if (debouncedSearch) {
            result = result.filter(equipe =>
                equipe.nom.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        return result.sort((a, b) => a.nom.localeCompare(b.nom));
    }, [activeTab, equipesParLigue, equipes, debouncedSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleTabChange = (ligueId: number | null) => {
        setActiveTab(ligueId);
    };

    return (
        <div
            className="min-h-screen text-gray-900 dark:text-white relative"
            style={{
                backgroundImage: `url(${equipeBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>

            <div className="relative z-10">
                <Head title="Équipes" />
                <PublicHeader />
                <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
                    <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Équipes</h1>

                    {/* Onglets */}
                    <div className="mb-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-2 shadow-2xl">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleTabChange(null)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === null
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 dark:bg-gray-700/50 text-white hover:bg-white/20 dark:hover:bg-gray-600/50'
                                }`}
                            >
                                Toutes
                            </button>
                            {ligues.map(ligue => (
                                <button
                                    key={ligue.id}
                                    onClick={() => handleTabChange(ligue.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === ligue.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white/10 dark:bg-gray-700/50 text-white hover:bg-white/20 dark:hover:bg-gray-600/50'
                                    }`}
                                >
                                    Niv {ligue.niveau} - {ligue.nom}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Champ de recherche */}
                    <div className="mb-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-4 shadow-2xl">
                        <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
                            Rechercher une équipe
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Nom de l'équipe..."
                            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Liste des équipes */}
                    {filteredEquipes.length > 0 ? (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {filteredEquipes.map(equipe => (
                                    <Link
                                        key={equipe.id}
                                        href={`/equipes/${equipe.id}`}
                                        className="bg-white/10 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 dark:hover:bg-gray-600/50 transition-colors border border-gray-700 dark:border-gray-600 hover:border-blue-400"
                                    >
                                        <div className="flex items-center gap-3">
                                            <EquipeLogo
                                                equipeId={equipe.id}
                                                logo={equipe.logo}
                                                nom={equipe.nom}
                                                size="lg"
                                                className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0"
                                            />
                                            <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                                                {equipe.nom}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-8 shadow-2xl text-center">
                            <p className="text-white dark:text-gray-100 text-lg">
                                {searchTerm
                                    ? `Aucune équipe trouvée pour "${searchTerm}"`
                                    : 'Aucune équipe disponible'}
                            </p>
                        </div>
                    )}
                </main>
                <footer className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-300 dark:text-gray-400 text-center">
                    © {new Date().getFullYear()} SPDL
                </footer>
            </div>
        </div>
    );
}

