import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Saisons', href: '/saisons' },
    { title: 'Détails', href: '/saisons/show' },
];

interface Equipe { id: number; nom: string; logo?: string }
interface Match {
    id: number;
    equipe_home_id: number;
    equipe_away_id: number;
    score_home: number;
    score_away: number;
    termine: boolean;
    home_equipe?: Equipe;
    away_equipe?: Equipe;
}
interface Journee {
    id: number;
    numero?: number;
    date?: string | null;
    matchs: Match[];
}
interface Ligue { id: number; nom: string }
interface Saison {
    id: number;
    nom: string;
    ligue: Ligue;
    journees: Journee[];
}
interface Props { saison: Saison }

export default function SaisonShow({ saison }: Props) {
    const { processing } = useForm({});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Saison ${saison.nom}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saison : {saison.nom}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{saison.ligue?.nom}</p>
                    </div>
                    <Link
                        href={`/saisons/${saison.id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Modifier la saison
                    </Link>
                </div>

                <div className="space-y-4">
                    {saison.journees?.length ? (
                        saison.journees
                            .slice()
                            .sort((a, b) => (a.numero || 0) - (b.numero || 0))
                            .map(j => (
                                <div key={j.id} id={`journee-${j.numero ?? j.id}`} className="bg-white dark:bg-gray-800 shadow rounded-lg">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">Journée {j.numero ?? '-'}{j.date ? ` · ${new Date(j.date).toLocaleDateString('fr-FR')}` : ''}</div>
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        {j.matchs?.length ? (
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Domicile</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Extérieur</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                                                        <th className="px-4 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {j.matchs.map(m => (
                                                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-4 py-2 text-sm">
                                                                {m.home_equipe?.logo ? (
                                                                    <img src={m.home_equipe.logo} alt={m.home_equipe.nom} className="h-6 w-6 inline-block mr-2 rounded object-cover" />
                                                                ) : <span className="inline-block h-6 w-6 mr-2 rounded bg-gray-200 dark:bg-gray-700" />}
                                                                <span className="text-gray-900 dark:text-gray-100">{m.home_equipe?.nom ?? `#${m.equipe_home_id}`}</span>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                                                {m.score_home} - {m.score_away}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {m.away_equipe?.logo ? (
                                                                    <img src={m.away_equipe.logo} alt={m.away_equipe.nom} className="h-6 w-6 inline-block mr-2 rounded object-cover" />
                                                                ) : <span className="inline-block h-6 w-6 mr-2 rounded bg-gray-200 dark:bg-gray-700" />}
                                                                <span className="text-gray-900 dark:text-gray-100">{m.away_equipe?.nom ?? `#${m.equipe_away_id}`}</span>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.termine ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                                                                    {m.termine ? 'Terminé' : 'Non'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-right text-sm">
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <Link
                                                                        href={`/matchs/${m.id}/edit`}
                                                                        className="px-2.5 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700"
                                                                    >
                                                                        Modifier
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Aucun match.</div>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pas encore de journées.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


