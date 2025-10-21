import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';

interface Ligue { id: number; nom: string; niveau: number }
interface Saison { id: number; nom: string; date_debut: string; ligue_id: number }
interface Standing { equipe_id: number; nom: string; logo?: string; joue: number; gagne: number; nul: number; perdu: number; bp: number; bc: number; diff: number; points: number }

interface Props {
    ligues: Ligue[];
    saisons: Saison[];
    selectedLigueId: number | null;
    selectedSaisonId: number | null;
    standings: Standing[];
}

export default function Classement({ ligues = [], saisons = [], selectedLigueId, selectedSaisonId, standings = [] }: Props) {
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
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Head title="Classement" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-6">Classement</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ligue (par niveau)</label>
                        <select value={ligueId as any} onChange={handleChangeLigue} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                            {ligues?.sort((a,b)=>a.niveau-b.niveau).map(l => (
                                <option key={l.id} value={l.id}>{`Niv ${l.niveau} - ${l.nom}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Saison (plus récente d'abord)</label>
                        <select value={saisonId as any} onChange={handleChangeSaison} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                            {saisons?.map(s => (
                                <option key={s.id} value={s.id}>{s.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {standings.length ? (
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">Équipe</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">J</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">V</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">N</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">D</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">BP</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">BC</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">Diff</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {standings.map((st, idx) => (
                                    <tr key={st.equipe_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-3 py-2 text-xs text-gray-500">{idx+1}</td>
                                        <td className="px-3 py-2 flex items-center gap-2">
                                            {st.logo ? <img src={st.logo} className="h-6 w-6 rounded object-cover" /> : <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 inline-block" />}
                                            <span>{st.nom}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right">{st.joue}</td>
                                        <td className="px-3 py-2 text-right">{st.gagne}</td>
                                        <td className="px-3 py-2 text-right">{st.nul}</td>
                                        <td className="px-3 py-2 text-right">{st.perdu}</td>
                                        <td className="px-3 py-2 text-right">{st.bp}</td>
                                        <td className="px-3 py-2 text-right">{st.bc}</td>
                                        <td className="px-3 py-2 text-right">{st.diff > 0 ? `+${st.diff}` : st.diff}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{st.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">Aucun classement disponible.</p>
                )}
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">© {new Date().getFullYear()} SPDL</footer>
        </div>
    );
}


