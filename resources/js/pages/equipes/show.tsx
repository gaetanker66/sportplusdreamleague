import { Head, Link } from '@inertiajs/react';
import EquipeLogo from '@/components/equipe-logo';
import PublicHeader from '@/components/PublicHeader';
import equipeBackground from '../../../images/equipe-background.avif';

interface Poste {
    id: number;
    nom: string;
}

interface Joueur {
    id: number;
    nom: string;
    photo?: string;
    description?: string;
    poste?: Poste;
}

interface Rival {
    id: number;
    nom: string;
    logo?: string;
}

interface PalmaresItem {
    saison?: string;
    ligue?: string;
    coupe?: string;
    modele?: string;
    annee?: string;
}

interface Palmares {
    saisons_ligues: PalmaresItem[];
    coupes: PalmaresItem[];
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    created_at: string;
    joueurs?: Joueur[];
    rival?: Rival;
}

interface Props {
    equipe: Equipe;
    palmares: Palmares;
}

export default function EquipesShow({ equipe, palmares }: Props) {
    const anneeFondation = equipe.created_at ? new Date(equipe.created_at).getFullYear() : null;
    const totalTitres = palmares.saisons_ligues.length + palmares.coupes.length;

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
                <Head title={equipe.nom} />
                <PublicHeader />
                <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
                    <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">{equipe.nom}</h1>

                    {/* En-tête avec logo et infos principales */}
                    <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <EquipeLogo 
                            equipeId={equipe.id} 
                            logo={equipe.logo}
                            nom={equipe.nom}
                            size="xl"
                            className="rounded-lg"
                        />
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Informations du club</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {anneeFondation && (
                                        <div>
                                            <p className="text-sm font-medium text-white/80 drop-shadow-md">Fondé en</p>
                                            <p className="text-lg text-white drop-shadow-md">{anneeFondation}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-white/80 drop-shadow-md">Palmarès</p>
                                        <p className="text-lg text-white drop-shadow-md">
                                            {totalTitres > 0 ? `${totalTitres} titre${totalTitres > 1 ? 's' : ''}` : 'Néant'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {equipe.description && (
                                <div>
                                    <p className="text-sm font-medium text-white/80 drop-shadow-md mb-1">Description</p>
                                    <p className="text-white drop-shadow-md">{equipe.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                    {/* Palmarès */}
                    {totalTitres > 0 && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Palmarès</h2>
                            <div className="space-y-4">
                                {palmares.saisons_ligues.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-white/90 mb-2 drop-shadow-md">Championnats de ligue</h3>
                                        <ul className="space-y-2">
                                            {palmares.saisons_ligues.map((item, index) => (
                                                <li key={index} className="flex items-center gap-2 text-white drop-shadow-md">
                                                    <span className="font-medium">{item.saison}</span>
                                                    <span className="text-white/70">-</span>
                                                    <span>{item.ligue}</span>
                                                    {item.annee && (
                                                        <>
                                                            <span className="text-white/70">-</span>
                                                            <span className="text-white/70">{item.annee}</span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {palmares.coupes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-white/90 mb-2 drop-shadow-md">Coupes et tournois</h3>
                                        <ul className="space-y-2">
                                            {palmares.coupes.map((item, index) => (
                                                <li key={index} className="flex items-center gap-2 text-white drop-shadow-md">
                                                    <span className="font-medium">{item.coupe}</span>
                                                    {item.modele && (
                                                        <>
                                                            <span className="text-white/70">-</span>
                                                            <span>{item.modele}</span>
                                                        </>
                                                    )}
                                                    {item.annee && (
                                                        <>
                                                            <span className="text-white/70">-</span>
                                                            <span className="text-white/70">{item.annee}</span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Effectif */}
                    {equipe.joueurs && equipe.joueurs.length > 0 && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Effectif</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {equipe.joueurs.map((joueur) => (
                                    <div 
                                        key={joueur.id} 
                                        className="bg-gray-900/50 dark:bg-gray-800/50 rounded-lg p-4 hover:shadow-md transition-shadow backdrop-blur-sm border border-gray-700 dark:border-gray-600"
                                    >
                                        {joueur.photo ? (
                                            <img 
                                                src={joueur.photo} 
                                                alt={joueur.nom}
                                                className="w-full h-32 object-cover rounded-lg mb-2"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-800/50 dark:bg-gray-700/50 rounded-lg mb-2 flex items-center justify-center">
                                                <span className="text-white/70 text-sm">Pas de photo</span>
                                            </div>
                                        )}
                                        <div>
                                            <Link 
                                                href={`/joueurs/${joueur.id}`}
                                                className="font-semibold text-white hover:text-blue-400 hover:underline transition-colors block"
                                            >
                                                {joueur.nom}
                                            </Link>
                                            {joueur.poste && (
                                                <p className="text-sm text-white/80">{joueur.poste.nom}</p>
                                            )}
                                            {joueur.description && (
                                                <p className="text-xs text-white/70 mt-1 line-clamp-2">
                                                    {joueur.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rival historique */}
                    {equipe.rival && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Rival historique</h2>
                            <Link 
                                href={`/equipes/${equipe.rival.id}`}
                                className="flex items-center gap-4 hover:bg-gray-900/50 dark:hover:bg-gray-800/50 rounded-lg p-4 transition-colors"
                            >
                                <EquipeLogo 
                                    equipeId={equipe.rival.id} 
                                    logo={equipe.rival.logo}
                                    nom={equipe.rival.nom}
                                    size="lg"
                                    className="rounded-lg"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-white">{equipe.rival.nom}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </main>
                <footer className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/70 dark:text-white/60 text-center">
                    © {new Date().getFullYear()} SPDL
                </footer>
            </div>
        </div>
    );
}


