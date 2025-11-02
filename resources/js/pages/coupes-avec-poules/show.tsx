import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import * as React from 'react';

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
}

interface PouleMatch {
    id: number;
    equipe_home_id: number;
    equipe_away_id: number;
    score_home?: number | null;
    score_away?: number | null;
    termine: boolean;
    home_equipe?: Equipe; // when serialized as homeEquipe
    away_equipe?: Equipe; // when serialized as awayEquipe
    homeEquipe?: Equipe;
    awayEquipe?: Equipe;
}

interface Poule {
    id: number;
    nom: string;
    numero: number;
    equipes: Equipe[];
    matchs: PouleMatch[];
}

interface Modele {
    id: number;
    nom: string;
    logo?: string;
}

interface CoupeAvecPoule {
    id: number;
    nom: string;
    nombre_equipes: number;
    nombre_poules: number;
    qualifies_par_poule: number;
    modele?: Modele | null;
    poules: Poule[];
    phase_finale_generee?: boolean;
    coupe_phase_finale_id?: number;
    coupe_phase_finale?: {
        id: number;
        nom: string;
    };
}

interface Props {
    coupeAvecPoule: CoupeAvecPoule;
}

export default function CoupesAvecPoulesShow({ coupeAvecPoule }: Props) {
    return (
        <AppLayout>
            <Head title={`Coupe avec poules - ${coupeAvecPoule.nom}`} />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {coupeAvecPoule.nom}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {coupeAvecPoule.nombre_equipes} équipes • {coupeAvecPoule.nombre_poules} poules • {coupeAvecPoule.qualifies_par_poule} qualifiés/poule
                        </p>
                        {coupeAvecPoule.modele && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {coupeAvecPoule.modele.logo && (
                                    <img
                                        src={coupeAvecPoule.modele.logo}
                                        alt={coupeAvecPoule.modele.nom}
                                        className="w-6 h-6 rounded"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                    />
                                )}
                                <span>Modèle: {coupeAvecPoule.modele.nom}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!coupeAvecPoule.phase_finale_generee && (
                            <button
                                onClick={() => {
                                    if (confirm('Voulez-vous vraiment terminer les poules ?')) {
                                        router.post(`/coupes-avec-poules/${coupeAvecPoule.id}/finaliser`);
                                    }
                                }}
                                className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                title="Générer la phase finale à partir du classement"
                            >
                                Terminer les poules
                            </button>
                        )}
                        {coupeAvecPoule.phase_finale_generee && coupeAvecPoule.coupe_phase_finale && (
                            <Link
                                href={`/coupes/${coupeAvecPoule.coupe_phase_finale.id}/edit`}
                                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                title="Aller à la phase finale"
                            >
                                Voir la phase finale
                            </Link>
                        )}
                        <Link href="/dashboard/coupes-avec-poules" className="px-3 py-2 rounded bg-gray-600 text-white">
                            Retour
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {coupeAvecPoule.poules?.map((poule) => (
                        <div key={poule.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900 dark:text-white">{poule.nom}</h2>
                                <span className="text-xs text-gray-500 dark:text-gray-400">#{poule.numero}</span>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Classement calculé */}
                                {(() => {
                                    const teams = new Map<number, { team: Equipe; mj: number; v: number; n: number; d: number; bp: number; bc: number; diff: number; pts: number }>();
                                    (poule.equipes || []).forEach((e) => {
                                        teams.set(e.id, { team: e, mj: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 });
                                    });
                                    (poule.matchs || []).forEach((m) => {
                                        // Compter uniquement les matchs terminés
                                        if (!(m as any).termine) return;
                                        const sh = (m as any).score_home ?? 0;
                                        const sa = (m as any).score_away ?? 0;
                                        const home = teams.get((m as any).equipe_home_id);
                                        const away = teams.get((m as any).equipe_away_id);
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
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Classement</h3>
                                            <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Équipe</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MJ</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">V</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">D</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">BP</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">BC</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diff</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pts</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {classement.map((row, idx) => (
                                                            <tr key={row.team.id}>
                                                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{idx + 1}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                                    {row.team.logo ? (
                                                                        <img src={row.team.logo} alt={row.team.nom} className="h-5 w-5 rounded object-cover" />
                                                                    ) : (
                                                                        <span className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 inline-block" />
                                                                    )}
                                                                    {row.team.nom}
                                                                </td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.mj}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.v}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.n}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.d}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.bp}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.bc}</td>
                                                                <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{row.diff}</td>
                                                                <td className="px-3 py-2 text-sm text-center font-semibold text-gray-900 dark:text-gray-100">{row.pts}</td>
                                                            </tr>
                                                        ))}
                                                        {!classement.length && (
                                                            <tr>
                                                                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400" colSpan={10}>Aucun match terminé</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {/* Section équipes retirée à la demande: le classement suffit */}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matchs par journée</h3>
                                    {Object.entries(
                                        (poule.matchs || []).reduce<Record<number, PouleMatch[]>>((acc, m) => {
                                            const j = (m as any).journee || 0;
                                            if (!acc[j]) acc[j] = [];
                                            acc[j].push(m);
                                            return acc;
                                        }, {})
                                    ).sort(([a],[b]) => Number(a) - Number(b)).map(([journee, matchs]) => (
                                        <div key={journee} className="mb-3">
                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Journée {journee}</div>
                                            <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Domicile</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Extérieur</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {matchs.map((m) => {
                                                            const home = m.homeEquipe || (m as any).home_equipe;
                                                            const away = m.awayEquipe || (m as any).away_equipe;
                                                            return (
                                                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{home?.nom ?? '—'}</td>
                                                                    <td className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                                                                        {m.score_home ?? 0} - {m.score_away ?? 0}
                                                                        {(m as any).termine ? (
                                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Terminé</span>
                                                                        ) : null}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">{away?.nom ?? '—'}</td>
                                                                    <td className="px-3 py-2 text-sm text-right">
                                                                        <a href={`/poule-matchs/${m.id}/edit`} className="inline-flex items-center px-2.5 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                                                                            Modifier
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                    {!poule.matchs?.length && (
                                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded">Aucun match</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}


