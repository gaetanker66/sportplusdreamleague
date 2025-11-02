import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Saisons', href: '/saisons' },
    { title: 'Match', href: '/matchs/edit' },
];

interface Equipe { id: number; nom: string }
interface Match {
    id: number;
    home_equipe?: Equipe;
    away_equipe?: Equipe;
    equipe_home_id: number;
    equipe_away_id: number;
    gardien_home_id?: number | null;
    gardien_away_id?: number | null;
    arrets_home: number;
    arrets_away: number;
    score_home: number;
    score_away: number;
    termine: boolean;
    buts?: { id: number; equipe_id: number; buteur_id: number; passeur_id?: number | null; minute?: string | null; type?: string }[];
    cartons?: { id: number; joueur_id: number; equipe_id?: number | null; type: 'jaune' | 'rouge'; minute?: number | null }[];
}

interface SimplePlayer { id: number; nom: string }
interface Props { match: Match; homeGardiens: SimplePlayer[]; awayGardiens: SimplePlayer[]; homePlayers: SimplePlayer[]; awayPlayers: SimplePlayer[]; saisonId?: number; journeeNumero?: number; readOnly?: boolean }

export default function MatchEdit({ match, homeGardiens, awayGardiens, homePlayers, awayPlayers, saisonId, journeeNumero, readOnly }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        gardien_home_id: match.gardien_home_id ?? '',
        gardien_away_id: match.gardien_away_id ?? '',
        arrets_home: match.arrets_home ?? 0,
        arrets_away: match.arrets_away ?? 0,
        termine: match.termine ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/matchs/${match.id}`);
    };

    const { } = useForm({});
    const [butHome, setButHome] = React.useState<{ buteur_id: number | ''; passeur_id: number | ''; minute: string | ''; type: string }>({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
    const [butAway, setButAway] = React.useState<{ buteur_id: number | ''; passeur_id: number | ''; minute: string | ''; type: string }>({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
    const [cartonHome, setCartonHome] = React.useState<{ joueur_id: number | ''; type: 'jaune' | 'rouge' | ''; minute: number | '' }>({ joueur_id: '', type: '', minute: '' });
    const [cartonAway, setCartonAway] = React.useState<{ joueur_id: number | ''; type: 'jaune' | 'rouge' | ''; minute: number | '' }>({ joueur_id: '', type: '', minute: '' });

    const addButHome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!butHome.buteur_id) return;
        router.post(`/matchs/${match.id}/buts`, { equipe_id: match.equipe_home_id, buteur_id: butHome.buteur_id, passeur_id: butHome.passeur_id || null, minute: butHome.minute || null, type: butHome.type, stay: true }, { preserveScroll: true, only: ['match'] });
        setButHome({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
    };
    const addButAway = (e: React.FormEvent) => {
        e.preventDefault();
        if (!butAway.buteur_id) return;
        router.post(`/matchs/${match.id}/buts`, { equipe_id: match.equipe_away_id, buteur_id: butAway.buteur_id, passeur_id: butAway.passeur_id || null, minute: butAway.minute || null, type: butAway.type, stay: true }, { preserveScroll: true, only: ['match'] });
        setButAway({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
    };

    const playerName = (id?: number | null) => {
        if (!id) return '';
        const p = [...homePlayers, ...awayPlayers].find(p => p.id === id);
        return p ? p.nom : `#${id}`;
    };
    
    // Fonction pour déterminer si un joueur appartient à l'équipe home dans ce match
    const isPlayerHome = (joueurId: number, cartonEquipeId?: number | null): boolean => {
        // Si le carton a un equipe_id stocké (nouveaux cartons avec transferts), l'utiliser directement
        if (cartonEquipeId !== undefined && cartonEquipeId !== null) {
            return cartonEquipeId === match.equipe_home_id;
        }
        
        // Sinon, vérifier si le joueur a un but pour l'équipe home
        const hasButHome = match.buts?.some(b => 
            b.equipe_id === match.equipe_home_id && (b.buteur_id === joueurId || b.passeur_id === joueurId)
        );
        // Si le joueur a un but pour l'équipe home, il était dans l'équipe home
        if (hasButHome) return true;
        
        // Si le joueur n'a pas de but pour l'équipe home mais a un but pour l'équipe away, il était dans l'équipe away
        const hasButAway = match.buts?.some(b => 
            b.equipe_id === match.equipe_away_id && (b.buteur_id === joueurId || b.passeur_id === joueurId)
        );
        if (hasButAway) return false;
        
        // Si le joueur n'a pas de but du tout, vérifier s'il est dans homePlayers ou awayPlayers
        // Si un joueur transféré apparaît dans les deux, on doit utiliser une autre logique
        const inHome = homePlayers.some(p => p.id === joueurId);
        const inAway = awayPlayers.some(p => p.id === joueurId);
        
        // Si le joueur est dans les deux listes (transféré), on ne peut pas déterminer sans plus d'info
        // Par défaut, on vérifie s'il est dans homePlayers mais pas dans awayPlayers
        // Sinon, on peut aussi vérifier s'il est gardien
        if (match.gardien_home_id === joueurId) return true;
        if (match.gardien_away_id === joueurId) return false;
        
        // Par défaut, si on ne peut pas déterminer, on suppose qu'il est dans l'équipe où il apparaît d'abord
        return inHome && !inAway;
    };
    const getTypeLabel = (type?: string) => {
        switch(type) {
            case 'coup_franc': return ' (CF)';
            case 'penalty': return ' (PEN)';
            case 'csc': return ' (CSC)';
            default: return '';
        }
    };

    const removeBut = (butId: number) => {
        router.delete(`/matchs/${match.id}/buts/${butId}`, { data: { stay: true }, preserveScroll: true, only: ['match'] });
    };

    const addCartonHome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cartonHome.joueur_id || !cartonHome.type) return;
        router.post(`/matchs/${match.id}/cartons`, { joueur_id: cartonHome.joueur_id, type: cartonHome.type, minute: cartonHome.minute || null, stay: true }, { preserveScroll: true, only: ['match'] });
        setCartonHome({ joueur_id: '', type: '', minute: '' });
    };
    const addCartonAway = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cartonAway.joueur_id || !cartonAway.type) return;
        router.post(`/matchs/${match.id}/cartons`, { joueur_id: cartonAway.joueur_id, type: cartonAway.type, minute: cartonAway.minute || null, stay: true }, { preserveScroll: true, only: ['match'] });
        setCartonAway({ joueur_id: '', type: '', minute: '' });
    };

    const removeCarton = (cartonId: number) => {
        router.delete(`/matchs/${match.id}/cartons/${cartonId}`, { data: { stay: true }, preserveScroll: true, only: ['match'] });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier le match #${match.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le match</h1>
                        <p className="text-gray-600 dark:text-gray-400">{match.home_equipe?.nom} vs {match.away_equipe?.nom}</p>
                    </div>
                    <Link
                        href={saisonId ? `/saisons/${saisonId}${journeeNumero ? `#journee-${journeeNumero}` : ''}` : '/saisons'}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gardien domicile</label>
                                    <select
                                        value={data.gardien_home_id as any}
                                        onChange={(e) => setData('gardien_home_id', e.target.value ? Number(e.target.value) : '')}
                                        disabled={readOnly}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-60"
                                    >
                                        <option value="">-</option>
                                        {homeGardiens?.map(j => (
                                            <option key={j.id} value={j.id}>{j.nom}</option>
                                        ))}
                                    </select>
                                    {errors.gardien_home_id && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.gardien_home_id as any}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gardien extérieur</label>
                                    <select
                                        value={data.gardien_away_id as any}
                                        onChange={(e) => setData('gardien_away_id', e.target.value ? Number(e.target.value) : '')}
                                        disabled={readOnly}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-60"
                                    >
                                        <option value="">-</option>
                                        {awayGardiens?.map(j => (
                                            <option key={j.id} value={j.id}>{j.nom}</option>
                                        ))}
                                    </select>
                                    {errors.gardien_away_id && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.gardien_away_id as any}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arrêts domicile</label>
                                    <input type="number" min={0} value={data.arrets_home}
                                        onChange={(e) => setData('arrets_home', Number(e.target.value))}
                                        disabled={readOnly}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-60" />
                                    {errors.arrets_home && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.arrets_home as any}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arrêts extérieur</label>
                                    <input type="number" min={0} value={data.arrets_away}
                                        onChange={(e) => setData('arrets_away', Number(e.target.value))}
                                        disabled={readOnly}
                                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-60" />
                                    {errors.arrets_away && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.arrets_away as any}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={!!data.termine} onChange={(e) => setData('termine', e.target.checked)} disabled={readOnly} />
                                    Match terminé
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={processing || readOnly}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter but - {match.home_equipe?.nom}</h3>
                                <form onSubmit={addButHome} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Buteur</label>
                                        <select disabled={readOnly} value={butHome.buteur_id as any} onChange={(e) => setButHome({ ...butHome, buteur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {(butHome.type === 'csc' ? awayPlayers : homePlayers).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Passeur (optionnel)</label>
                                        <select disabled={readOnly} value={butHome.passeur_id as any} onChange={(e) => setButHome({ ...butHome, passeur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {homePlayers.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                                        <input disabled={readOnly} type="text" value={butHome.minute as any} onChange={(e) => setButHome({ ...butHome, minute: e.target.value })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60" placeholder="ex: 45, 45+2, 90+3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Type de but</label>
                                        <select disabled={readOnly} value={butHome.type} onChange={(e) => {
                                            const newType = e.target.value;
                                            setButHome({ 
                                                ...butHome, 
                                                type: newType, 
                                                // Ne vider le buteur que si on passe à CSC (car CSC = buteur adverse)
                                                buteur_id: newType === 'csc' ? '' : butHome.buteur_id
                                            });
                                        }} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="normal">Normal</option>
                                            <option value="coup_franc">Coup franc</option>
                                            <option value="penalty">Penalty</option>
                                            <option value="csc">CSC</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={readOnly} className="px-3 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Ajouter but</button>
                                </form>
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Buts enregistrés</h4>
                                    <ul className="space-y-1">
                                        {match.buts?.filter(b => b.equipe_id === match.equipe_home_id).map(b => (
                                            <li key={b.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                                                <span>{playerName(b.buteur_id)}{b.minute != null ? ` (${b.minute}')` : ''}{b.passeur_id ? `, passe: ${playerName(b.passeur_id)}` : ''}{getTypeLabel(b.type)}</span>
                                                <button type="button" onClick={() => removeBut(b.id)} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Supprimer</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter but - {match.away_equipe?.nom}</h3>
                                <form onSubmit={addButAway} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Buteur</label>
                                        <select disabled={readOnly} value={butAway.buteur_id as any} onChange={(e) => setButAway({ ...butAway, buteur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {(butAway.type === 'csc' ? homePlayers : awayPlayers).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Passeur (optionnel)</label>
                                        <select disabled={readOnly} value={butAway.passeur_id as any} onChange={(e) => setButAway({ ...butAway, passeur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {awayPlayers.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                                        <input disabled={readOnly} type="text" value={butAway.minute as any} onChange={(e) => setButAway({ ...butAway, minute: e.target.value })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60" placeholder="ex: 45, 45+2, 90+3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Type de but</label>
                                        <select disabled={readOnly} value={butAway.type} onChange={(e) => {
                                            const newType = e.target.value;
                                            setButAway({ 
                                                ...butAway, 
                                                type: newType, 
                                                // Ne vider le buteur que si on passe à CSC (car CSC = buteur adverse)
                                                buteur_id: newType === 'csc' ? '' : butAway.buteur_id
                                            });
                                        }} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="normal">Normal</option>
                                            <option value="coup_franc">Coup franc</option>
                                            <option value="penalty">Penalty</option>
                                            <option value="csc">CSC</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={readOnly} className="px-3 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Ajouter but</button>
                                </form>
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Buts enregistrés</h4>
                                    <ul className="space-y-1">
                                        {match.buts?.filter(b => b.equipe_id === match.equipe_away_id).map(b => (
                                            <li key={b.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                                                <span>{playerName(b.buteur_id)}{b.minute != null ? ` (${b.minute}')` : ''}{b.passeur_id ? `, passe: ${playerName(b.passeur_id)}` : ''}{getTypeLabel(b.type)}</span>
                                                <button type="button" onClick={() => removeBut(b.id)} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Supprimer</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter carton - {match.home_equipe?.nom}</h3>
                                <form onSubmit={addCartonHome} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Joueur</label>
                                        <select disabled={readOnly} value={cartonHome.joueur_id as any} onChange={(e) => setCartonHome({ ...cartonHome, joueur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {homePlayers.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Type</label>
                                        <select disabled={readOnly} value={cartonHome.type} onChange={(e) => setCartonHome({ ...cartonHome, type: e.target.value as 'jaune' | 'rouge' | '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            <option value="jaune">Jaune</option>
                                            <option value="rouge">Rouge</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                                        <input disabled={readOnly} type="number" min={0} max={130} value={cartonHome.minute as any} onChange={(e) => setCartonHome({ ...cartonHome, minute: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60" />
                                    </div>
                                    <button type="submit" disabled={readOnly} className="px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Ajouter carton</button>
                                </form>
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cartons enregistrés</h4>
                                    <ul className="space-y-1">
                                        {match.cartons?.filter(c => isPlayerHome(c.joueur_id, c.equipe_id)).map(c => (
                                            <li key={c.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                                                <span className={`${c.type === 'rouge' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {playerName(c.joueur_id)} - {c.type} {c.minute != null ? `(${c.minute}')` : ''}
                                                </span>
                                                <button type="button" onClick={() => removeCarton(c.id)} disabled={readOnly} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs disabled:opacity-50">Supprimer</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter carton - {match.away_equipe?.nom}</h3>
                                <form onSubmit={addCartonAway} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Joueur</label>
                                        <select disabled={readOnly} value={cartonAway.joueur_id as any} onChange={(e) => setCartonAway({ ...cartonAway, joueur_id: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            {awayPlayers.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Type</label>
                                        <select disabled={readOnly} value={cartonAway.type} onChange={(e) => setCartonAway({ ...cartonAway, type: e.target.value as 'jaune' | 'rouge' | '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60">
                                            <option value="">-</option>
                                            <option value="jaune">Jaune</option>
                                            <option value="rouge">Rouge</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                                        <input disabled={readOnly} type="number" min={0} max={130} value={cartonAway.minute as any} onChange={(e) => setCartonAway({ ...cartonAway, minute: e.target.value ? Number(e.target.value) : '' })} className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md disabled:opacity-60" />
                                    </div>
                                    <button type="submit" disabled={readOnly} className="px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Ajouter carton</button>
                                </form>
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cartons enregistrés</h4>
                                    <ul className="space-y-1">
                                        {match.cartons?.filter(c => !isPlayerHome(c.joueur_id, c.equipe_id)).map(c => (
                                            <li key={c.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                                                <span className={`${c.type === 'rouge' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {playerName(c.joueur_id)} - {c.type} {c.minute != null ? `(${c.minute}')` : ''}
                                                </span>
                                                <button type="button" onClick={() => removeCarton(c.id)} disabled={readOnly} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs disabled:opacity-50">Supprimer</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


