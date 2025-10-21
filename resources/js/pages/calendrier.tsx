import { Head, Link } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Head title="Calendrier" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-6">Calendrier</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ligue</label>
                        <select value={ligueId as any} onChange={onLigue} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                            {ligues?.sort((a,b)=>a.niveau-b.niveau).map(l => (
                                <option key={l.id} value={l.id}>{`Niv ${l.niveau} - ${l.nom}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Saison</label>
                        <select value={saisonId as any} onChange={onSaison} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                            {saisons?.map(s => (
                                <option key={s.id} value={s.id}>{s.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {nextJournee ? (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">Prochaine journée {nextJournee.numero ? `(${nextJournee.numero})` : ''}</h2>
                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {nextJournee.matchs.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-3 py-2">
                                                {m.home_equipe?.logo ? <img src={m.home_equipe.logo} className="h-6 w-6 rounded inline-block mr-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block mr-2" />}
                                                {m.home_equipe?.nom ?? `#${m.equipe_home_id}`}
                                            </td>
                                            <td className="px-3 py-2 text-center w-24">{m.termine ? `${m.score_home} - ${m.score_away}` : '-'}</td>
                                            <td className="px-3 py-2 text-right">
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
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Aucune prochaine journée.</p>
                )}

                {pastJournees?.length ? (
                    <div className="space-y-6">
                        {pastJournees.map(j => (
                            <div key={j.id} className="">
                                <h3 className="text-lg font-semibold mb-2">Journée {j.numero ?? '-'}</h3>
                                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {j.matchs.map(m => (
                                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-3 py-2">
                                                        {m.home_equipe?.logo ? <img src={m.home_equipe.logo} className="h-6 w-6 rounded inline-block mr-2" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block mr-2" />}
                                                        {m.home_equipe?.nom ?? `#${m.equipe_home_id}`}
                                                    </td>
                                                    <td className="px-3 py-2 text-center w-24">{m.score_home} - {m.score_away}</td>
                                                    <td className="px-3 py-2 text-right">
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
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">© {new Date().getFullYear()} SPDL</footer>
        </div>
    );
}


