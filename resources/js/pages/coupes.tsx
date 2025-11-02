import { Head, Link, router } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';
import tournoisBackground from '../../images/tournois-background.avif';

export default function Coupes({ coupes, selectedCoupeId, selectedCoupe }: { 
    coupes: {id:number; nom:string; created_at:string; modele?: {id:number; nom:string; logo?:string}; type?: string}[];
    selectedCoupeId: number;
    selectedCoupe: any;
}) {
    const [selectedCoupeIdState, setSelectedCoupeIdState] = React.useState(selectedCoupeId);
    const [selectedModeleId, setSelectedModeleId] = React.useState<number | '' | 'sans-modele'>('');

    // Grouper les coupes par modèle
    const coupesByModele = React.useMemo(() => {
        const grouped: {[key: string]: typeof coupes} = {};
        coupes.forEach(coupe => {
            const modeleKey = coupe.modele?.id?.toString() || 'sans-modele';
            if (!grouped[modeleKey]) {
                grouped[modeleKey] = [];
            }
            grouped[modeleKey].push(coupe);
        });
        return grouped;
    }, [coupes]);

    // Obtenir les modèles uniques
    const modeles = React.useMemo(() => {
        const uniqueModeles = new Map();
        coupes.forEach(coupe => {
            if (coupe.modele) {
                uniqueModeles.set(coupe.modele.id, coupe.modele);
            }
        });
        return Array.from(uniqueModeles.values());
    }, [coupes]);

    // Vérifier s'il y a des coupes sans modèle
    const hasCoupesWithoutModele = React.useMemo(() => {
        return coupes.some(coupe => !coupe.modele);
    }, [coupes]);

    // Obtenir les coupes filtrées par modèle
    const filteredCoupes = React.useMemo(() => {
        if (!selectedModeleId) return coupes;
        if (selectedModeleId === 'sans-modele') {
            return coupesByModele['sans-modele'] || [];
        }
        return coupesByModele[selectedModeleId] || [];
    }, [selectedModeleId, coupesByModele, coupes]);

    // Debug: afficher les informations de filtrage
    React.useEffect(() => {
        console.log('Debug filtrage:', {
            selectedModeleId,
            totalCoupes: coupes.length,
            coupesSansModele: coupesByModele['sans-modele']?.length || 0,
            filteredCoupes: filteredCoupes.length
        });
    }, [selectedModeleId, coupes.length, coupesByModele, filteredCoupes.length]);

    const handleCoupeChange = (coupeId: number) => {
        setSelectedCoupeIdState(coupeId);
        router.get('/tournois', { coupe_id: coupeId }, { preserveState: true });
    };

    const handleModeleChange = (modeleId: number | '' | 'sans-modele') => {
        setSelectedModeleId(modeleId);
        // Utiliser la même logique que filteredCoupes
        let coupesToShow;
        if (!modeleId) {
            coupesToShow = coupes;
        } else if (modeleId === 'sans-modele') {
            coupesToShow = coupesByModele['sans-modele'] || [];
        } else {
            coupesToShow = coupesByModele[modeleId] || [];
        }
        
        if (coupesToShow.length > 0) {
            const firstCoupe = coupesToShow[0];
            setSelectedCoupeIdState(firstCoupe.id);
            router.get('/tournois', { coupe_id: firstCoupe.id }, { preserveState: true });
        }
    };

    const renderMatch = (match: any, isRetour: boolean = false) => {
        const homeTeam = match.home_equipe?.nom || (match.equipe_home_id ? `Équipe ${match.equipe_home_id}` : '-');
        const awayTeam = match.away_equipe?.nom || (match.equipe_away_id ? `Équipe ${match.equipe_away_id}` : '-');
        const homeLogo = match.home_equipe?.logo;
        const awayLogo = match.away_equipe?.logo;
        
        return (
            <div key={`${match.id}-${isRetour ? 'retour' : 'aller'}`} className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-white/80 dark:text-gray-200 mb-2">
                    {isRetour ? 'Retour' : 'Aller'}
                </div>
                
                {/* Équipes avec logos */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-2">
                        {homeLogo && (
                            <img 
                                src={homeLogo} 
                                alt={`Logo ${homeTeam}`}
                                className="w-6 h-6"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                        <span className="font-medium text-white">{homeTeam}</span>
                    </div>
                    
                    <div className="text-center">
                        <span className="text-lg font-bold text-white">
                            {match.termine ? `${match.score_home || 0} - ${match.score_away || 0}` : '-'}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{awayTeam}</span>
                        {awayLogo && (
                            <img 
                                src={awayLogo} 
                                alt={`Logo ${awayTeam}`}
                                className="w-6 h-6"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                    </div>
                </div>
                
                {/* Tirs au but */}
                {match.termine && isRetour && match.tirs_au_but_home !== null && match.tirs_au_but_away !== null && (
                    <div className="text-xs text-white/80 text-center">
                        TAB: {match.tirs_au_but_home} - {match.tirs_au_but_away}
                    </div>
                )}
            </div>
        );
    };

    const renderPoule = (poule: any) => {
        // Calculer le classement de la poule
        const teams = new Map();
        poule.equipes?.forEach((e: any) => {
            teams.set(e.id, { team: e, mj: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 });
        });
        
        (poule.matchs || []).forEach((m: any) => {
            if (!m.termine) return;
            const sh = m.score_home ?? 0;
            const sa = m.score_away ?? 0;
            const home = teams.get(m.equipe_home_id);
            const away = teams.get(m.equipe_away_id);
            if (!home || !away) return;
            
            home.mj += 1; away.mj += 1;
            home.bp += sh; home.bc += sa; home.diff = home.bp - home.bc;
            away.bp += sa; away.bc += sh; away.diff = away.bp - away.bc;
            
            if (sh > sa) { home.v += 1; home.pts += 3; away.d += 1; }
            else if (sh < sa) { away.v += 1; away.pts += 3; home.d += 1; }
            else { home.n += 1; away.n += 1; home.pts += 1; away.pts += 1; }
        });
        
        const classement = Array.from(teams.values()).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.diff !== a.diff) return b.diff - a.diff;
            if (b.bp !== a.bp) return b.bp - a.bp;
            return a.team.nom.localeCompare(b.team.nom);
        });

        return (
            <div key={poule.id} className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-4 shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 text-center drop-shadow-lg">
                    {poule.nom}
                </h3>
                
                {/* Classement */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-white dark:text-gray-100 mb-2 drop-shadow-md">Classement</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-700 dark:border-gray-600">
                                    <th className="text-left py-1 text-white">#</th>
                                    <th className="text-left py-1 text-white">Équipe</th>
                                    <th className="text-center py-1 text-white">MJ</th>
                                    <th className="text-center py-1 text-white">V</th>
                                    <th className="text-center py-1 text-white">N</th>
                                    <th className="text-center py-1 text-white">D</th>
                                    <th className="text-center py-1 text-white">BP</th>
                                    <th className="text-center py-1 text-white">BC</th>
                                    <th className="text-center py-1 text-white">Diff</th>
                                    <th className="text-center py-1 font-semibold text-white">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classement.map((team: any, index: number) => (
                                    <tr key={team.team.id} className="border-b border-gray-700 dark:border-gray-600">
                                        <td className="py-1 text-white/90">{index + 1}</td>
                                        <td className="py-1 font-medium text-white">{team.team.nom}</td>
                                        <td className="py-1 text-center text-white">{team.mj}</td>
                                        <td className="py-1 text-center text-green-400">{team.v}</td>
                                        <td className="py-1 text-center text-yellow-400">{team.n}</td>
                                        <td className="py-1 text-center text-red-400">{team.d}</td>
                                        <td className="py-1 text-center text-white">{team.bp}</td>
                                        <td className="py-1 text-center text-white">{team.bc}</td>
                                        <td className="py-1 text-center text-white">{team.diff > 0 ? '+' : ''}{team.diff}</td>
                                        <td className="py-1 text-center font-semibold text-white">{team.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Matchs */}
                <div>
                    <h4 className="text-sm font-medium text-white dark:text-gray-100 mb-2 drop-shadow-md">Matchs</h4>
                    <div className="space-y-2">
                        {(poule.matchs || []).map((match: any) => (
                            <div key={match.id} className="bg-gray-900/50 dark:bg-gray-800/50 rounded p-2 backdrop-blur-sm">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        {match.home_equipe?.logo && (
                                            <img 
                                                src={match.home_equipe.logo} 
                                                alt={`Logo ${match.home_equipe.nom}`}
                                                className="w-4 h-4"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <span className="font-medium text-white">{match.home_equipe?.nom || `Équipe ${match.equipe_home_id}`}</span>
                                    </div>
                                    
                                    <div className="text-center">
                                        <span className="font-bold text-white">
                                            {match.termine ? `${match.score_home || 0} - ${match.score_away || 0}` : '-'}
                                        </span>
                                        {match.termine && (
                                            <div className="text-xs text-white/70">
                                                J{match.journee}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-white">{match.away_equipe?.nom || `Équipe ${match.equipe_away_id}`}</span>
                                        {match.away_equipe?.logo && (
                                            <img 
                                                src={match.away_equipe.logo} 
                                                alt={`Logo ${match.away_equipe.nom}`}
                                                className="w-4 h-4"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderRound = (round: any) => {
        const matches = round.matchs?.filter((m: any) => m.is_aller) || [];
        
        return (
            <div key={round.id} className="flex flex-col space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                        {round.label || `Round ${round.numero}`}
                    </h3>
                </div>
                <div className="space-y-3">
                    {matches.map((match: any) => (
                        <div key={match.id} className="space-y-2">
                            {/* Match aller */}
                            {renderMatch(match, false)}
                            
                            {/* Match retour */}
                            {match.match_retour && renderMatch(match.match_retour, true)}
                            
                            {/* Score cumulé */}
                            {(match.termine && match.match_retour?.termine) && (
                                <div className="bg-blue-900/60 dark:bg-blue-800/60 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-700/50">
                                    <div className="text-xs text-blue-200 dark:text-blue-300 mb-1">Score cumulé</div>
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="flex items-center space-x-1">
                                            {match.home_equipe?.logo && (
                                                <img 
                                                    src={match.home_equipe.logo} 
                                                    alt={`Logo ${match.home_equipe.nom}`}
                                                    className="w-5 h-5"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <span className="text-sm font-semibold text-blue-200 dark:text-blue-100">
                                                {match.score_cumule_home || 0}
                                            </span>
                                        </div>
                                        <span className="text-blue-200 dark:text-blue-100">-</span>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm font-semibold text-blue-200 dark:text-blue-100">
                                                {match.score_cumule_away || 0}
                                            </span>
                                            {match.away_equipe?.logo && (
                                                <img 
                                                    src={match.away_equipe.logo} 
                                                    alt={`Logo ${match.away_equipe.nom}`}
                                                    className="w-5 h-5"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Tournois" />
            <div 
                className="min-h-screen text-gray-900 dark:text-white relative"
                style={{
                    backgroundImage: `url(${tournoisBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                {/* Overlay pour améliorer la lisibilité du texte */}
                <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
                
                <div className="relative z-10">
                <PublicHeader />

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                    {coupes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-white dark:text-gray-100 drop-shadow-md">Aucune coupe disponible</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Sélection des modèles et coupes */}
                            <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-2xl p-4 sm:p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Sélection du modèle */}
                                    <div>
                                        <label className="block text-sm font-medium text-white dark:text-gray-100 mb-2 drop-shadow-md">
                                            Modèle de coupe
                                        </label>
                                        <select 
                                            value={selectedModeleId} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    handleModeleChange('');
                                                } else if (value === 'sans-modele') {
                                                    handleModeleChange('sans-modele');
                                                } else {
                                                    handleModeleChange(Number(value));
                                                }
                                            }}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Tous les modèles</option>
                                            {modeles.map(modele => (
                                                <option key={modele.id} value={modele.id}>
                                                    {modele.logo && (
                                                        <span className="mr-2">🏆</span>
                                                    )}
                                                    {modele.nom}
                                                </option>
                                            ))}
                                            {hasCoupesWithoutModele && (
                                                <option value="sans-modele">Sans modèle</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Sélection du tournoi */}
                                    <div>
                                        <label className="block text-sm font-medium text-white dark:text-gray-100 mb-2 drop-shadow-md">
                                            Tournoi
                                        </label>
                                        <select 
                                            value={selectedCoupeIdState} 
                                            onChange={(e) => handleCoupeChange(Number(e.target.value))}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {filteredCoupes.map(coupe => (
                                                <option key={coupe.id} value={coupe.id}>
                                                    {coupe.modele?.logo && (
                                                        <span className="mr-2">🏆</span>
                                                    )}
                                                    {coupe.nom}
                                                    {coupe.type === 'coupe_avec_poule' && ' - phase de poules'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                                    {selectedCoupe && (
                                        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-2xl p-6">
                                            <div className="text-center mb-6">
                                                <div className="flex items-center justify-center space-x-3 mb-2">
                                                    {selectedCoupe.modele?.logo && (
                                                        <img 
                                                            src={selectedCoupe.modele.logo} 
                                                            alt={`Logo ${selectedCoupe.modele.nom}`}
                                                            className="w-12 h-12 object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                                        {selectedCoupe.nom}
                                                    </h2>
                                                </div>
                                                {selectedCoupe.modele?.description && (
                                                    <p className="text-sm text-white/90 dark:text-gray-100 drop-shadow-md">
                                                        {selectedCoupe.modele.description}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Affichage selon le type de coupe */}
                                            {selectedCoupe.type === 'coupe_avec_poule' ? (
                                                // Affichage des poules pour les coupes avec poules
                                                <div>
                                                    {selectedCoupe.poules && selectedCoupe.poules.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {selectedCoupe.poules.map((poule: any) => renderPoule(poule))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <p className="text-white dark:text-gray-100 drop-shadow-md">
                                                                Cette coupe avec poules n'a pas encore de poules générées
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Phase finale si elle existe */}
                                                    {selectedCoupe.rounds && selectedCoupe.rounds.length > 0 && (
                                                        <div className="mt-8">
                                                            <h3 className="text-xl font-semibold text-white mb-4 text-center drop-shadow-lg">
                                                                Phase finale
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                                {selectedCoupe.rounds.map((round: any) => renderRound(round))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Affichage normal pour les coupes classiques
                                                <div>
                                                    {selectedCoupe.rounds && selectedCoupe.rounds.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                            {selectedCoupe.rounds.map((round: any) => renderRound(round))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <p className="text-white dark:text-gray-100 drop-shadow-md">
                                                                Cette coupe n'a pas encore d'arbre généré
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </>
    );
}
