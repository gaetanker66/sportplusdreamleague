import { Head, Link } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';

interface Ligue { id: number; nom: string; niveau: number }
interface Saison { id: number; nom: string; date_debut: string; ligue_id: number }
interface Coupe { id: number; nom: string; created_at: string; modele?: {id: number; nom: string; logo?: string} }
interface CoupeModele { id: number; nom: string; logo?: string }
interface Stat { joueur_id: number; nom: string; val: number }
interface Props {
    ligues: Ligue[];
    saisons: Saison[];
    coupes: Coupe[];
    coupeModeles: CoupeModele[];
    selectedLigueId: number | null;
    selectedSaisonId: number | null;
    selectedCoupeId: number | null;
    selectedModeleId: number | null;
    type: 'buteur' | 'passeur' | 'arret' | 'clean_sheet' | 'coup_franc' | 'penalty' | 'carton_jaune' | 'carton_rouge';
    stats: Stat[];
    mode: 'ligue' | 'tournois';
}

export default function Statistiques({ ligues = [], saisons = [], coupes = [], coupeModeles = [], selectedLigueId, selectedSaisonId, selectedCoupeId, selectedModeleId, type = 'buteur', stats = [], mode = 'ligue' }: Props) {
    const [ligueId, setLigueId] = React.useState<number | ''>(selectedLigueId || (ligues[0]?.id ?? ''));
    const [saisonId, setSaisonId] = React.useState<number | ''>(selectedSaisonId || (saisons[0]?.id ?? ''));
    const [coupeId, setCoupeId] = React.useState<number | ''>(selectedCoupeId || (coupes && Array.isArray(coupes) && coupes[0]?.id ? coupes[0].id : ''));
    const [modeleId, setModeleId] = React.useState<number | ''>(selectedModeleId || '');
    const [selType, setSelType] = React.useState(type);
    const [selMode, setSelMode] = React.useState(mode);

    // Grouper les coupes par modèle
    const coupesByModele = React.useMemo(() => {
        const grouped: {[key: string]: typeof coupes} = {};
        if (coupes && Array.isArray(coupes)) {
            coupes.forEach(coupe => {
                const modeleKey = coupe.modele?.id?.toString() || 'sans-modele';
                if (!grouped[modeleKey]) {
                    grouped[modeleKey] = [];
                }
                grouped[modeleKey].push(coupe);
            });
        }
        return grouped;
    }, [coupes]);

    // Obtenir les modèles uniques - utiliser coupeModeles directement du backend
    const modeles = React.useMemo(() => {
        // Utiliser coupeModeles directement du backend au lieu de les extraire des coupes
        return coupeModeles && Array.isArray(coupeModeles) ? coupeModeles : [];
    }, [coupeModeles]);

    // Vérifier s'il y a des coupes sans modèle
    const hasCoupesWithoutModele = React.useMemo(() => {
        return coupes && Array.isArray(coupes) ? coupes.some(coupe => !coupe.modele) : false;
    }, [coupes]);

    // Obtenir les coupes filtrées par modèle
    const filteredCoupes = React.useMemo(() => {
        if (!coupes || !Array.isArray(coupes)) return [];
        if (!modeleId) return coupes;
        return coupesByModele[modeleId] || [];
    }, [modeleId, coupesByModele, coupes]);

    // Réinitialiser la coupe sélectionnée quand le modèle change
    React.useEffect(() => {
        if (filteredCoupes && filteredCoupes.length > 0) {
            // Si la coupe actuellement sélectionnée n'est plus dans la liste filtrée
            if (!filteredCoupes.some(c => c.id === coupeId)) {
                setCoupeId(filteredCoupes[0].id);
            }
        } else {
            // Si aucune coupe après filtrage, réinitialiser
            setCoupeId('');
        }
    }, [modeleId, filteredCoupes]);

    const go = (l?: number | '', s?: number | '', t?: string, m?: string, c?: number | '', mod?: number | '') => {
        const lid = (l === undefined ? ligueId : l) || '';
        const sid = (s === undefined ? saisonId : s) || '';
        const cid = (c === undefined ? coupeId : c) || '';
        const modId = (mod === undefined ? modeleId : mod) || '';
        const typ = (t === undefined ? selType : t) || 'buteur';
        const modMode = (m === undefined ? selMode : m) || 'ligue';
        const p = new URLSearchParams();
        if (lid) p.set('ligue_id', String(lid));
        if (sid) p.set('saison_id', String(sid));
        if (cid) p.set('coupe_id', String(cid));
        if (modId) p.set('modele_id', String(modId));
        if (typ) p.set('type', typ);
        if (modMode) p.set('mode', modMode);
        window.location.href = `/statistiques?${p.toString()}`;
    };

    const onLigue = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setLigueId(id);
        go(id, '', selType, selMode, undefined, modeleId);
    };
    const onSaison = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setSaisonId(id);
        go(undefined, id, selType, selMode, undefined, modeleId);
    };
    const onCoupe = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : '';
        setCoupeId(id);
        go(undefined, undefined, selType, selMode, id, modeleId);
    };
    const onModele = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const id = value ? Number(value) : '';
        setModeleId(id);
        go(undefined, undefined, selType, selMode, coupeId, id);
    };
    const onType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const t = e.target.value as any;
        setSelType(t);
        go(undefined, undefined, t, selMode, undefined, modeleId);
    };
    const onMode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const m = e.target.value as 'ligue' | 'tournois';
        setSelMode(m);
        go(undefined, undefined, selType, m, undefined, modeleId);
    };

    // Fonction pour obtenir le label approprié selon le type
    const getStatLabel = (type: string) => {
        const labels: {[key: string]: string} = {
            'buteur': 'buts',
            'passeur': 'passes',
            'arret': 'arrêts',
            'clean_sheet': 'clean sheets',
            'coup_franc': 'coups francs',
            'penalty': 'penalties',
            'carton_jaune': 'cartons jaunes',
            'carton_rouge': 'cartons rouges'
        };
        return labels[type] || 'total';
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Head title="Statistiques" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <h1 className="text-3xl font-bold mb-6">Statistiques</h1>
                
                {/* Mode Selection */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Mode</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="mode"
                                value="ligue"
                                checked={selMode === 'ligue'}
                                onChange={onMode}
                                className="mr-2"
                            />
                            <span className="text-sm">Ligue</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="mode"
                                value="tournois"
                                checked={selMode === 'tournois'}
                                onChange={onMode}
                                className="mr-2"
                            />
                            <span className="text-sm">Tournois</span>
                        </label>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {selMode === 'ligue' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Modèle de coupe</label>
                                <select 
                                    value={modeleId} 
                                    onChange={onModele}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="">Tous les modèles</option>
                                    {modeles.map(modele => (
                                        <option key={modele.id} value={modele.id}>
                                            {modele.logo ? '🏆 ' : ''}{modele.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tournoi</label>
                                <select value={coupeId as any} onChange={onCoupe} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                                    {filteredCoupes?.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.modele?.logo ? '🏆 ' : ''}{c.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Type</label>
                        <select value={selType} onChange={onType} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                            <option value="buteur">Buteur</option>
                            <option value="passeur">Passeur</option>
                            <option value="arret">Arrêt</option>
                            <option value="clean_sheet">Clean sheet</option>
                            <option value="coup_franc">Coup franc</option>
                            <option value="penalty">Penalty</option>
                            <option value="carton_jaune">Carton jaune</option>
                            <option value="carton_rouge">Carton rouge</option>
                        </select>
                    </div>
                </div>

                {stats?.length ? (
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">Joueur</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">{getStatLabel(selType)}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {stats.map((st, idx) => (
                                    <tr key={st.joueur_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-3 py-2 text-xs text-gray-500">{idx+1}</td>
                                        <td className="px-3 py-2">{st.nom}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{st.val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">Aucune statistique.</p>
                )}
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">© {new Date().getFullYear()} SPDL</footer>
        </div>
    );
}


