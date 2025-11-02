import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';
import classementBackground from '../../images/classement-background.avif';

interface Ligue { id: number; nom: string; niveau: number }
interface Saison { id: number; nom: string; date_debut: string; ligue_id: number }
interface Standing { equipe_id: number; nom: string; logo?: string; joue: number; gagne: number; nul: number; perdu: number; bp: number; bc: number; diff: number; points: number }
interface Equipe { id: number; nom: string }
interface RecentMatch {
    id: number;
    journee_numero?: number;
    equipe_home_id: number;
    equipe_away_id: number;
    home_equipe?: Equipe;
    away_equipe?: Equipe;
    score_home: number;
    score_away: number;
    termine: boolean;
}

interface Props {
    ligues: Ligue[];
    saisons: Saison[];
    selectedLigueId: number | null;
    selectedSaisonId: number | null;
    standings: Standing[];
    recentMatches: RecentMatch[];
}

export default function Classement({ ligues = [], saisons = [], selectedLigueId, selectedSaisonId, standings = [], recentMatches = [] }: Props) {
    const [ligueId, setLigueId] = React.useState<number | ''>(selectedLigueId || (ligues[0]?.id ?? ''));
    const [saisonId, setSaisonId] = React.useState<number | ''>(selectedSaisonId || (saisons[0]?.id ?? ''));

    const handleChangeLigue = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setLigueId(id);
        // on reset la saison: on laisse le serveur renvoyer la plus récente par défaut
        window.location.href = `/classement?ligue_id=${id}`;
    };
    const handleChangeSaison = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSaisonId(id);
        const lid = ligueId || selectedLigueId;
        window.location.href = `/classement?ligue_id=${lid}&saison_id=${id}`;
    };

    // Fonction pour obtenir les classes de couleur selon le score
    const getScoreColorClasses = (match: RecentMatch): { homeColor: string; awayColor: string } => {
        if (!match.termine) {
            return { homeColor: '', awayColor: '' };
        }

        const { score_home, score_away } = match;

        // Match nul 0-0 : bleu ciel
        if (score_home === 0 && score_away === 0) {
            return {
                homeColor: 'text-sky-500 dark:text-sky-400',
                awayColor: 'text-sky-500 dark:text-sky-400',
            };
        }

        // Match nul mais pas 0-0 : violet
        if (score_home === score_away) {
            return {
                homeColor: 'text-purple-500 dark:text-purple-400',
                awayColor: 'text-purple-500 dark:text-purple-400',
            };
        }

        // Score du gagnant en vert, du perdant en rouge
        if (score_home > score_away) {
            return {
                homeColor: 'text-green-600 dark:text-green-400 font-semibold',
                awayColor: 'text-red-600 dark:text-red-400',
            };
        } else {
            return {
                homeColor: 'text-red-600 dark:text-red-400',
                awayColor: 'text-green-600 dark:text-green-400 font-semibold',
            };
        }
    };
    return (
        <div 
            className="min-h-screen text-gray-900 dark:text-white relative"
            style={{
                backgroundImage: `url(${classementBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
            
            <div className="relative z-10">
            <Head title="Classement" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Classement</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-white dark:text-gray-100 mb-1 drop-shadow-md">Ligue (par niveau)</label>
                        <select value={ligueId as any} onChange={handleChangeLigue} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                            {ligues?.sort((a,b)=>a.niveau-b.niveau).map(l => (
                                <option key={l.id} value={l.id}>{`Niv ${l.niveau} - ${l.nom}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white dark:text-gray-100 mb-1 drop-shadow-md">Saison (plus récente d'abord)</label>
                        <select value={saisonId as any} onChange={handleChangeSaison} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                            {saisons?.map(s => (
                                <option key={s.id} value={s.id}>{s.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {standings.length ? (
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-900/50 dark:bg-gray-800/50">
                                <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-white">#</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-white">Équipe</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">J</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">V</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">N</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">D</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">BP</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">BC</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">Diff</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 dark:divide-gray-600">
                                {standings.map((st, idx) => (
                                    <tr key={st.equipe_id} className="hover:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                        <td className="px-3 py-2 text-xs text-white/90">{idx+1}</td>
                                        <td className="px-3 py-2 flex items-center gap-2">
                                            {st.logo ? <img src={st.logo} className="h-6 w-6 rounded object-cover" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block" />}
                                            <span className="text-white">{st.nom}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-white">{st.joue}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.gagne}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.nul}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.perdu}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.bp}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.bc}</td>
                                        <td className="px-3 py-2 text-right text-white">{st.diff > 0 ? `+${st.diff}` : st.diff}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-white">{st.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                ) : (
                    <p className="text-white dark:text-gray-100 drop-shadow-md">Aucun classement disponible.</p>
                )}

                {recentMatches.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-3 text-white drop-shadow-lg">Derniers résultats</h2>
                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-900/50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-white">Journée</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-white">Domicile</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-white">Score</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-white">Extérieur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700 dark:divide-gray-600">
                                    {recentMatches.map((match) => {
                                        const colors = getScoreColorClasses(match);
                                        return (
                                            <tr key={match.id} className="hover:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                                <td className="px-3 py-2 text-xs text-white/90">
                                                    {match.journee_numero ? `J${match.journee_numero}` : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-white">
                                                    {match.home_equipe?.nom ?? `#${match.equipe_home_id}`}
                                                </td>
                                                <td className="px-3 py-2 text-center text-sm">
                                                    <span>
                                                        <span className={colors.homeColor}>{match.score_home}</span>
                                                        <span className="mx-1">-</span>
                                                        <span className={colors.awayColor}>{match.score_away}</span>
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-right text-white">
                                                    {match.away_equipe?.nom ?? `#${match.equipe_away_id}`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-300 dark:text-gray-400 text-center">
                © {new Date().getFullYear()} SPDL
            </footer>
            </div>
        </div>
    );
}


