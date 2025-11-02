import { Head, Link } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';
import calendrierBackground from '../../images/calendrier-background.avif';

interface Ligue { id: number; nom: string; niveau: number }
interface Saison { id: number; nom: string; date_debut: string; ligue_id: number }
interface Equipe { id: number; nom: string; logo?: string }
interface Match { id: number; equipe_home_id: number; equipe_away_id: number; termine: boolean; home_equipe?: Equipe; away_equipe?: Equipe; score_home: number; score_away: number }
interface Journee { id: number; numero?: number; date?: string | null; matchs: Match[] }
interface Props {
  ligues: Ligue[];
  saisons: Saison[];
  selectedLigueId: number | null;
  selectedSaisonId: number | null;
  nextJournee: Journee | null;
  pastJournees: Journee[];
}

export default function Calendrier({ ligues = [], saisons = [], selectedLigueId, selectedSaisonId, nextJournee, pastJournees = [] }: Props) {
    const [ligueId, setLigueId] = React.useState<number | ''>(selectedLigueId || (ligues[0]?.id ?? ''));
    const [saisonId, setSaisonId] = React.useState<number | ''>(selectedSaisonId || (saisons[0]?.id ?? ''));

    // Fonction pour obtenir les classes de couleur selon le score
    const getScoreColorClasses = (match: Match): { homeColor: string; awayColor: string } => {
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

    const onLigue = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setLigueId(id);
        window.location.href = `/calendrier?ligue_id=${id}`;
    };
    const onSaison = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSaisonId(id);
        const lid = ligueId || selectedLigueId;
        window.location.href = `/calendrier?ligue_id=${lid}&saison_id=${id}`;
    };
    return (
        <div 
            className="min-h-screen text-gray-900 dark:text-white relative"
            style={{
                backgroundImage: `url(${calendrierBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
            
            <div className="relative z-10">
            <Head title="Calendrier" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Calendrier</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-white dark:text-gray-100 mb-1 drop-shadow-md">Ligue</label>
                        <select value={ligueId as any} onChange={onLigue} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                            {ligues?.sort((a,b)=>a.niveau-b.niveau).map(l => (
                                <option key={l.id} value={l.id}>{`Niv ${l.niveau} - ${l.nom}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white dark:text-gray-100 mb-1 drop-shadow-md">Saison</label>
                        <select value={saisonId as any} onChange={onSaison} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                            {saisons?.map(s => (
                                <option key={s.id} value={s.id}>{s.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {nextJournee ? (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-white drop-shadow-lg">Prochaine journée {nextJournee.numero ? `(${nextJournee.numero})` : ''}</h2>
                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <tbody className="divide-y divide-gray-700 dark:divide-gray-600">
                                    {nextJournee.matchs.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                            <td className="px-3 py-2 text-white">
                                                {m.home_equipe?.logo ? <img src={m.home_equipe.logo} className="h-6 w-6 rounded inline-block mr-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block mr-2" />}
                                                {m.home_equipe?.nom ?? `#${m.equipe_home_id}`}
                                            </td>
                                            <td className="px-3 py-2 text-center w-24">
                                                {m.termine ? (
                                                    (() => {
                                                        const colors = getScoreColorClasses(m);
                                                        return (
                                                            <span>
                                                                <span className={colors.homeColor}>{m.score_home}</span>
                                                                <span className="mx-1">-</span>
                                                                <span className={colors.awayColor}>{m.score_away}</span>
                                                            </span>
                                                        );
                                                    })()
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right text-white">
                                                {m.away_equipe?.nom ?? `#${m.equipe_away_id}`}
                                                {m.away_equipe?.logo ? <img src={m.away_equipe.logo} className="h-6 w-6 rounded inline-block ml-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block ml-2" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-white dark:text-gray-100 mb-6 drop-shadow-md">Aucune prochaine journée.</p>
                )}

                {pastJournees?.length ? (
                    <div className="space-y-6">
                        {pastJournees.map(j => (
                            <div key={j.id} className="">
                                <h3 className="text-lg font-semibold mb-2 text-white drop-shadow-lg">Journée {j.numero ?? '-'}</h3>
                                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-black/40 dark:bg-black/60 backdrop-blur-sm shadow-2xl">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <tbody className="divide-y divide-gray-700 dark:divide-gray-600">
                                            {j.matchs.map(m => (
                                                <tr key={m.id} className="hover:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                                    <td className="px-3 py-2 text-white">
                                                        {m.home_equipe?.logo ? <img src={m.home_equipe.logo} className="h-6 w-6 rounded inline-block mr-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block mr-2" />}
                                                        {m.home_equipe?.nom ?? `#${m.equipe_home_id}`}
                                                    </td>
                                                    <td className="px-3 py-2 text-center w-24">
                                                        {(() => {
                                                            const colors = getScoreColorClasses(m);
                                                            return (
                                                                <span>
                                                                    <span className={colors.homeColor}>{m.score_home}</span>
                                                                    <span className="mx-1">-</span>
                                                                    <span className={colors.awayColor}>{m.score_away}</span>
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-white">
                                                        {m.away_equipe?.nom ?? `#${m.equipe_away_id}`}
                                                        {m.away_equipe?.logo ? <img src={m.away_equipe.logo} className="h-6 w-6 rounded inline-block ml-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block ml-2" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-300 dark:text-gray-400 text-center">
                © {new Date().getFullYear()} SPDL
            </footer>
            </div>
        </div>
    );
}


