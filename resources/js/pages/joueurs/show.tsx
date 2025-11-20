import { Head, Link } from '@inertiajs/react';
import EquipeLogo from '@/components/equipe-logo';
import PublicHeader from '@/components/PublicHeader';
import equipeBackground from '../../../images/equipe-background.avif';

interface Poste {
    id: number;
    nom: string;
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
}

interface Transfert {
    id: number;
    date_transfert: string;
    ancienne_equipe_id?: number;
    nouvelle_equipe_id?: number;
    ancienneEquipe?: Equipe;
    nouvelleEquipe?: Equipe;
}

interface StatsCompetition {
    type: string;
    nom: string;
    ligue?: string;
    buts: number;
    passes_decisives: number;
    cartons_jaunes: number;
    cartons_rouges: number;
    matchs_gardien: number;
    arrets: number;
    clean_sheets: number;
    homme_du_match: number;
}

interface Stats {
    buts: number;
    passes_decisives: number;
    cartons_jaunes: number;
    cartons_rouges: number;
    matchs_gardien: number;
    arrets: number;
    clean_sheets: number;
    homme_du_match: number;
    competitions: StatsCompetition[];
}

interface Joueur {
    id: number;
    nom: string;
    photo?: string;
    description?: string;
    equipe_id: number;
    poste_id?: number;
    equipe?: Equipe;
    poste?: Poste;
    postesSecondaires?: Poste[];
    transferts?: Transfert[];
}

interface Props {
    joueur: Joueur;
    stats: Stats;
}

export default function JoueursShow({ joueur, stats }: Props) {
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
                <Head title={joueur.nom} />
                <PublicHeader />
                <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
                    <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">{joueur.nom}</h1>

                    {/* En-tête avec photo et infos principales */}
                    <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {joueur.photo ? (
                                <img 
                                    src={joueur.photo} 
                                    alt={joueur.nom}
                                    className="w-48 h-48 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-800/50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                                    <span className="text-white/70 text-sm">Pas de photo</span>
                                </div>
                            )}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4">Informations</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-white/80 drop-shadow-md mb-1">Poste principal</p>
                                            <p className="text-lg text-white drop-shadow-md">
                                                {joueur.poste?.nom || 'Non défini'}
                                            </p>
                                        </div>
                                        {joueur.postesSecondaires && joueur.postesSecondaires.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-white/80 drop-shadow-md mb-1">Postes secondaires</p>
                                                <p className="text-lg text-white drop-shadow-md">
                                                    {joueur.postesSecondaires.map(p => p.nom).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        {joueur.equipe && (
                                            <div>
                                                <p className="text-sm font-medium text-white/80 drop-shadow-md mb-1">Équipe actuelle</p>
                                                <Link 
                                                    href={`/equipes/${joueur.equipe.id}`}
                                                    className="flex items-center gap-2 text-lg text-white hover:text-blue-400 hover:underline transition-colors"
                                                >
                                                    <EquipeLogo 
                                                        equipeId={joueur.equipe.id} 
                                                        logo={joueur.equipe.logo}
                                                        nom={joueur.equipe.nom}
                                                        size="md"
                                                        className="rounded"
                                                    />
                                                    {joueur.equipe.nom}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {joueur.description && (
                                    <div>
                                        <p className="text-sm font-medium text-white/80 drop-shadow-md mb-1">Description</p>
                                        <p className="text-white drop-shadow-md">{joueur.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistiques globales */}
                    {(stats.buts > 0 || stats.passes_decisives > 0 || stats.matchs_gardien > 0 || 
                      stats.cartons_jaunes > 0 || stats.cartons_rouges > 0 || stats.homme_du_match > 0) && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Statistiques actuelles</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {stats.buts > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-white">{stats.buts}</p>
                                        <p className="text-sm text-white/80">Buts</p>
                                    </div>
                                )}
                                {stats.passes_decisives > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-white">{stats.passes_decisives}</p>
                                        <p className="text-sm text-white/80">Passes décisives</p>
                                    </div>
                                )}
                                {stats.matchs_gardien > 0 && (
                                    <>
                                        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                            <p className="text-2xl font-bold text-white">{stats.matchs_gardien}</p>
                                            <p className="text-sm text-white/80">Matchs gardien</p>
                                        </div>
                                        {stats.arrets > 0 && (
                                            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                                <p className="text-2xl font-bold text-white">{stats.arrets}</p>
                                                <p className="text-sm text-white/80">Arrêts</p>
                                            </div>
                                        )}
                                        {stats.clean_sheets > 0 && (
                                            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                                <p className="text-2xl font-bold text-white">{stats.clean_sheets}</p>
                                                <p className="text-sm text-white/80">Clean sheets</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {stats.cartons_jaunes > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{stats.cartons_jaunes}</p>
                                        <p className="text-sm text-white/80">Cartons jaunes</p>
                                    </div>
                                )}
                                {stats.cartons_rouges > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-red-400">{stats.cartons_rouges}</p>
                                        <p className="text-sm text-white/80">Cartons rouges</p>
                                    </div>
                                )}
                                {stats.homme_du_match > 0 && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-yellow-300">{stats.homme_du_match}</p>
                                        <p className="text-sm text-white/80">Hommes du match</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Statistiques par compétition */}
                    {stats.competitions.length > 0 && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Statistiques par compétition</h2>
                            <div className="space-y-4">
                                {stats.competitions.map((competition, index) => (
                                    <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                                        <h3 className="text-lg font-medium text-white mb-3">
                                            {competition.nom}
                                            {competition.ligue && (
                                                <span className="text-white/70 text-sm ml-2">- {competition.ligue}</span>
                                            )}
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {competition.buts > 0 && (
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-white">{competition.buts}</p>
                                                    <p className="text-xs text-white/80">Buts</p>
                                                </div>
                                            )}
                                            {competition.passes_decisives > 0 && (
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-white">{competition.passes_decisives}</p>
                                                    <p className="text-xs text-white/80">Passes</p>
                                                </div>
                                            )}
                                            {competition.matchs_gardien > 0 && (
                                                <>
                                                    <div className="text-center">
                                                        <p className="text-xl font-bold text-white">{competition.matchs_gardien}</p>
                                                        <p className="text-xs text-white/80">Matchs gardien</p>
                                                    </div>
                                                    {competition.arrets > 0 && (
                                                        <div className="text-center">
                                                            <p className="text-xl font-bold text-white">{competition.arrets}</p>
                                                            <p className="text-xs text-white/80">Arrêts</p>
                                                        </div>
                                                    )}
                                                    {competition.clean_sheets > 0 && (
                                                        <div className="text-center">
                                                            <p className="text-xl font-bold text-white">{competition.clean_sheets}</p>
                                                            <p className="text-xs text-white/80">Clean sheets</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {competition.cartons_jaunes > 0 && (
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-yellow-400">{competition.cartons_jaunes}</p>
                                                    <p className="text-xs text-white/80">Cartons jaunes</p>
                                                </div>
                                            )}
                                            {competition.cartons_rouges > 0 && (
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-red-400">{competition.cartons_rouges}</p>
                                                    <p className="text-xs text-white/80">Cartons rouges</p>
                                                </div>
                                            )}
                                            {competition.homme_du_match > 0 && (
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-yellow-300">{competition.homme_du_match}</p>
                                                    <p className="text-xs text-white/80">Hommes du match</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historique des transferts */}
                    {((joueur.transferts && joueur.transferts.length > 0) || joueur.equipe) && (
                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Historique des transferts</h2>
                            <div className="space-y-3">
                                {/* Équipe actuelle */}
                                {joueur.equipe && (
                                    <div className="bg-gray-900/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-4 flex-1">
                                            <EquipeLogo 
                                                equipeId={joueur.equipe.id} 
                                                logo={joueur.equipe.logo}
                                                nom={joueur.equipe.nom}
                                                size="md"
                                                className="rounded"
                                            />
                                            <Link 
                                                href={`/equipes/${joueur.equipe.id}`}
                                                className="text-white hover:text-blue-400 hover:underline transition-colors font-semibold"
                                            >
                                                {joueur.equipe.nom}
                                            </Link>
                                            <span className="text-white/70 text-sm">(Actuelle)</span>
                                        </div>
                                    </div>
                                )}
                                {/* Transferts passés */}
                                {joueur.transferts && joueur.transferts.map((transfert) => (
                                    <div 
                                        key={transfert.id} 
                                        className="bg-gray-900/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {transfert.ancienneEquipe && (
                                                <>
                                                    <EquipeLogo 
                                                        equipeId={transfert.ancienneEquipe.id} 
                                                        logo={transfert.ancienneEquipe.logo}
                                                        nom={transfert.ancienneEquipe.nom}
                                                        size="md"
                                                        className="rounded"
                                                    />
                                                    <Link 
                                                        href={`/equipes/${transfert.ancienneEquipe.id}`}
                                                        className="text-white hover:text-blue-400 hover:underline transition-colors"
                                                    >
                                                        {transfert.ancienneEquipe.nom}
                                                    </Link>
                                                </>
                                            )}
                                            <span className="text-white/70">→</span>
                                            {transfert.nouvelleEquipe && (
                                                <>
                                                    <EquipeLogo 
                                                        equipeId={transfert.nouvelleEquipe.id} 
                                                        logo={transfert.nouvelleEquipe.logo}
                                                        nom={transfert.nouvelleEquipe.nom}
                                                        size="md"
                                                        className="rounded"
                                                    />
                                                    <Link 
                                                        href={`/equipes/${transfert.nouvelleEquipe.id}`}
                                                        className="text-white hover:text-blue-400 hover:underline transition-colors"
                                                    >
                                                        {transfert.nouvelleEquipe.nom}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            {new Date(transfert.date_transfert).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

